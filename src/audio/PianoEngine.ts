import { DEFAULT_STRENGTH } from '../music/model'
import type { MusicDocument } from '../music/model'
import { isPianoPitch } from '../music/pitch'
import { nearestSample, PIANO_SAMPLES } from './samples'
import { planPlayback } from './playback'

export type AudioStatus = 'idle' | 'loading' | 'ready' | 'suspended' | 'error'
export interface PianoSnapshot {
  status: AudioStatus
  loaded: number
  total: number
  error: string
  pressed: number[]
  sustained: number[]
  sustain: boolean
  volume: number
}
interface Voice {
  id: string; pitch: number; source: AudioBufferSourceNode; gain: GainNode
  held: boolean; releasing: boolean; ended: boolean; scheduled: boolean
}
interface EngineOptions {
  createContext?: () => AudioContext
  loadSamples?: (context: AudioContext, progress: (loaded: number) => void, signal: AbortSignal) => Promise<Map<number, AudioBuffer>>
}

async function loadSamples(context: AudioContext, progress: (loaded: number) => void, signal: AbortSignal) {
  const queue = [...PIANO_SAMPLES]
  const buffers = new Map<number, AudioBuffer>()
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length && !signal.aborted) {
      const sample = queue.shift()!
      const request = new AbortController()
      const abort = () => request.abort()
      signal.addEventListener('abort', abort, { once: true })
      const timeout = setTimeout(abort, 20_000)
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}audio/piano/${sample.file}`, { signal: request.signal })
        if (!response.ok) throw new Error('The piano could not load. Check your connection and try again.')
        const buffer = await context.decodeAudioData(await response.arrayBuffer())
        if (signal.aborted) throw new Error('Piano loading cancelled.')
        buffers.set(sample.pitch, buffer)
        progress(buffers.size)
      } finally {
        clearTimeout(timeout)
        signal.removeEventListener('abort', abort)
      }
    }
  }))
  if (signal.aborted || buffers.size !== PIANO_SAMPLES.length) throw new Error('Piano loading cancelled.')
  return buffers
}

export class PianoEngine {
  private context?: AudioContext
  private master?: GainNode
  private compressor?: DynamicsCompressorNode
  private buffers = new Map<number, AudioBuffer>()
  private voices = new Map<string, Voice>()
  private listeners = new Set<(snapshot: PianoSnapshot) => void>()
  private status: AudioStatus = 'idle'
  private loaded = 0
  private error = ''
  private sustain = false
  private volume = 0.65
  private serial = 0
  private disposed = false
  private loading?: Promise<void>
  private abort?: AbortController
  private options: EngineOptions

  constructor(options: EngineOptions = {}) { this.options = options }

  snapshot(): PianoSnapshot {
    const live = [...this.voices.values()].filter(v => !v.scheduled)
    return {
      status: this.status, loaded: this.loaded, total: PIANO_SAMPLES.length, error: this.error,
      pressed: [...new Set(live.filter(v => v.held).map(v => v.pitch))],
      sustained: [...new Set(live.filter(v => !v.held && !v.releasing && !v.ended).map(v => v.pitch))],
      sustain: this.sustain, volume: this.volume,
    }
  }

  subscribe(listener: (snapshot: PianoSnapshot) => void) {
    this.listeners.add(listener)
    listener(this.snapshot())
    return () => { this.listeners.delete(listener) }
  }

  private emit() { if (!this.disposed) this.listeners.forEach(listener => listener(this.snapshot())) }

  /** Invoke directly from a user gesture, before awaiting sample downloads. */
  enable(): Promise<void> {
    if (this.disposed) return Promise.resolve()
    if (this.loading) return this.loading
    this.status = 'loading'
    this.error = ''
    this.emit()
    this.loading = this.initialize().catch(error => {
      this.abort?.abort()
      if (!this.disposed) {
        this.status = 'error'
        this.error = error instanceof DOMException && error.name === 'AbortError'
          ? 'The piano took too long to load. Check your connection and try again.'
          : error instanceof TypeError ? 'The piano could not load. Check your connection and try again.'
          : error instanceof Error ? error.message : 'Piano could not start.'
        this.emit()
      }
    }).finally(() => { this.loading = undefined })
    return this.loading
  }

  private async initialize() {
    if (!this.context) {
      const create = this.options.createContext ?? (() => {
        const constructor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!constructor) throw new Error('This browser does not support Web Audio.')
        return new constructor({ latencyHint: 'interactive' })
      })
      this.context = create()
      this.master = this.context.createGain()
      this.master.gain.value = this.volume ** 2
      this.compressor = this.context.createDynamicsCompressor()
      this.compressor.threshold.value = -10
      this.compressor.knee.value = 12
      this.compressor.ratio.value = 6
      this.master.connect(this.compressor)
      this.compressor.connect(this.context.destination)
      this.context.onstatechange = () => {
        if (this.disposed) return
        if (this.context!.state !== 'running') {
          this.stopAll()
          this.status = 'suspended'
        } else if (this.buffers.size === PIANO_SAMPLES.length) this.status = 'ready'
        this.emit()
      }
    }
    const context = this.context
    // Both resume and the silent buffer start happen within the original gesture.
    const resume = context.resume()
    const unlock = context.createBufferSource()
    unlock.buffer = context.createBuffer(1, 1, context.sampleRate)
    unlock.connect(context.destination)
    unlock.onended = () => unlock.disconnect()
    unlock.start()
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([resume, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Sound is paused. Tap Enable piano to try again.')), 5000) })])
    } finally { clearTimeout(timer) }
    if (this.disposed) return
    if (this.buffers.size !== PIANO_SAMPLES.length) {
      this.loaded = 0
      this.abort = new AbortController()
      const buffers = await (this.options.loadSamples ?? loadSamples)(context, count => {
        this.loaded = count
        this.emit()
      }, this.abort.signal)
      if (this.disposed) return
      this.buffers = buffers
      this.loaded = buffers.size
    }
    this.status = context.state === 'running' ? 'ready' : 'suspended'
    this.emit()
  }

  setVolume(volume: number) {
    if (!Number.isFinite(volume)) return
    this.volume = Math.max(0, Math.min(1, volume))
    this.master?.gain.setTargetAtTime(this.volume ** 2, this.context!.currentTime, 0.015)
    this.emit()
  }

  setSustain(down: boolean) {
    this.sustain = down
    if (!down && this.context) this.voices.forEach(voice => {
      if (!voice.held && !voice.scheduled) this.release(voice, this.context!.currentTime)
    })
    this.emit()
  }

  noteOn(pitch: number, strength = DEFAULT_STRENGTH): string | undefined {
    if (!isPianoPitch(pitch) || !Number.isFinite(strength) || strength <= 0 || strength > 1 || this.status !== 'ready' || this.context?.state !== 'running' || this.voices.size >= 128) return
    const voice = this.createVoice(pitch, strength, this.context.currentTime, false)
    this.emit()
    return voice.id
  }

  noteOff(id: string) {
    const voice = this.voices.get(id)
    if (!voice || voice.scheduled) return
    voice.held = false
    if (voice.ended) this.voices.delete(id)
    else if (!this.sustain) this.release(voice, this.context!.currentTime)
    this.emit()
  }

  /** Short native-clock note for assistive click activation without a held key. */
  tap(pitch: number) {
    if (!isPianoPitch(pitch) || this.status !== 'ready' || this.context?.state !== 'running') return
    const voice = this.createVoice(pitch, DEFAULT_STRENGTH, this.context.currentTime, true)
    this.release(voice, this.context.currentTime + 0.25)
  }

  private createVoice(pitch: number, strength: number, at: number, scheduled: boolean): Voice {
    const sample = nearestSample(pitch)
    const buffer = this.buffers.get(sample.pitch)
    if (!buffer) throw new Error('The piano samples are not ready.')
    const source = this.context!.createBufferSource()
    const gain = this.context!.createGain()
    source.buffer = buffer
    source.playbackRate.value = 2 ** ((pitch - sample.pitch) / 12)
    gain.gain.setValueAtTime(strength * 0.7, at)
    source.connect(gain)
    gain.connect(this.master!)
    const voice: Voice = { id: `voice-${++this.serial}`, pitch, source, gain, held: !scheduled, releasing: false, ended: false, scheduled }
    this.voices.set(voice.id, voice)
    source.onended = () => {
      voice.ended = true
      source.disconnect()
      gain.disconnect()
      if (!voice.held) this.voices.delete(voice.id)
      this.emit()
    }
    source.start(at)
    return voice
  }

  private release(voice: Voice, at: number) {
    if (voice.releasing || voice.ended) return
    voice.releasing = true
    voice.gain.gain.setTargetAtTime(0, at, 0.06)
    voice.source.stop(at + 0.4)
  }

  /** Schedule source data against the audio clock, never JavaScript note timers. */
  play(document: MusicDocument): () => void {
    if (this.status !== 'ready' || this.context?.state !== 'running') throw new Error('Enable the piano before playback.')
    const plan = planPlayback(document)
    const start = this.context.currentTime + 0.05
    const voices = plan.notes.map(note => {
      const voice = this.createVoice(note.noteNumber, note.strength, start + note.startSeconds, true)
      this.release(voice, start + note.soundReleaseSeconds)
      return voice
    })
    return () => { voices.forEach(voice => this.stopVoice(voice)); this.emit() }
  }

  private stopVoice(voice: Voice) {
    if (!voice.ended && this.context) {
      const now = this.context.currentTime
      voice.gain.gain.cancelScheduledValues(now)
      voice.gain.gain.setTargetAtTime(0, now, 0.005)
      try { voice.source.stop(now + 0.03) } catch { /* Source may already have naturally ended. */ }
    }
    this.voices.delete(voice.id)
  }

  stopAll() {
    this.voices.forEach(voice => this.stopVoice(voice))
    this.sustain = false
    this.emit()
  }

  dispose() {
    this.disposed = true
    this.abort?.abort()
    this.stopAll()
    this.listeners.clear()
    if (this.context) {
      this.context.onstatechange = null
      void this.context.close().catch(() => {})
    }
    this.buffers.clear()
  }
}
