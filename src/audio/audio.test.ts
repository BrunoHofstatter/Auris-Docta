import { describe, expect, it, vi } from 'vitest'
import scale from '../../examples/c-major-scale.json'
import type { MusicDocument } from '../music/model'
import { PianoEngine } from './PianoEngine'
import { PIANO_SAMPLES, nearestSample } from './samples'
import { planPlayback } from './playback'
import { COMPUTER_KEYS, pianoKeys, pianoRange } from '../piano/layout'

function fixture() { return structuredClone(scale) as MusicDocument }
function parameter(value = 1) {
  return { value, setValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() }
}
function harness(loader?: () => Promise<Map<number, AudioBuffer>>) {
  const sources: ReturnType<typeof source>[] = []
  const gains: { gain: ReturnType<typeof parameter>; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = []
  function source() {
    return { buffer: null, playbackRate: parameter(), connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null as (() => void) | null }
  }
  const context = {
    state: 'running', currentTime: 10, sampleRate: 44100, destination: {}, onstatechange: null as (() => void) | null,
    resume: vi.fn(async () => { context.state = 'running'; context.onstatechange?.() }),
    close: vi.fn(async () => { context.state = 'closed' }),
    createBuffer: vi.fn(() => ({})),
    createBufferSource: vi.fn(() => { const s = source(); sources.push(s); return s }),
    createGain: vi.fn(() => { const gain = { gain: parameter(), connect: vi.fn(), disconnect: vi.fn() }; gains.push(gain); return gain }),
    createDynamicsCompressor: vi.fn(() => ({ threshold: parameter(), knee: parameter(), ratio: parameter(), connect: vi.fn() })),
  }
  const buffers = new Map(PIANO_SAMPLES.map(s => [s.pitch, {} as AudioBuffer]))
  const load = vi.fn(loader ?? (async () => buffers))
  const create = vi.fn(() => context as unknown as AudioContext)
  const engine = new PianoEngine({ createContext: create, loadSamples: load })
  return { engine, context, sources, gains, load, create, buffers }
}

describe('sample and keyboard coverage', () => {
  it('covers all 88 notes without a large transposition', () => {
    expect(PIANO_SAMPLES).toHaveLength(30)
    for (let pitch = 21; pitch <= 108; pitch++) expect(Math.abs(nearestSample(pitch).pitch - pitch)).toBeLessThanOrEqual(1)
  })
  it('starts mobile at B3–C6, covers both limits, and fits 52 desktop white keys', () => {
    expect(pianoRange(true, 4)).toEqual([59, 84])
    expect(pianoRange(false, 4)).toEqual([21, 108])
    const all = new Set<number>()
    for (let octave = 0; octave <= 7; octave++) {
      const [low, high] = pianoRange(true, octave)
      const keys = pianoKeys(low, high)
      keys.forEach(key => { all.add(key.pitch); expect(key.left).toBeGreaterThanOrEqual(0); expect(key.left + key.width).toBeLessThanOrEqual(100.0001) })
    }
    expect(all.size).toBe(88)
    expect(pianoKeys(21, 108).filter(k => !k.black)).toHaveLength(52)
    expect(COMPUTER_KEYS.KeyA).toBe(60)
    expect(COMPUTER_KEYS.KeyW).toBe(61)
  })
})

describe('independent piano voices', () => {
  it('creates/resumes audio synchronously from enable and stays silent until playing', async () => {
    const h = harness()
    expect(h.engine.noteOn(60)).toBeUndefined()
    const ready = h.engine.enable()
    expect(h.create).toHaveBeenCalledOnce()
    expect(h.context.resume).toHaveBeenCalledOnce()
    await ready
    expect(h.engine.snapshot().status).toBe('ready')
    expect(h.sources).toHaveLength(1) // Only the silent unlock buffer.
    h.engine.dispose()
  })
  it('releases one voice without stopping another attack of the same pitch', async () => {
    const h = harness(); await h.engine.enable()
    const first = h.engine.noteOn(60)!
    const second = h.engine.noteOn(60)!
    expect(first).not.toBe(second)
    h.engine.noteOff(first)
    expect(h.sources[1].stop).toHaveBeenCalledOnce()
    expect(h.sources[2].stop).not.toHaveBeenCalled()
    expect(h.engine.snapshot().pressed).toEqual([60])
    h.engine.noteOff(second)
    expect(h.engine.snapshot().pressed).toEqual([])
    h.engine.dispose()
  })
  it('honors quiet strengths and ignores invalid live-note parameters', async () => {
    const h = harness(); await h.engine.enable()
    expect(h.engine.noteOn(20)).toBeUndefined()
    expect(h.engine.noteOn(60, NaN)).toBeUndefined()
    expect(h.engine.noteOn(60, 0)).toBeUndefined()
    h.engine.noteOn(60, 0.001)
    expect(h.gains[1].gain.setValueAtTime).toHaveBeenCalledWith(0.0007, 10)
    h.engine.dispose()
  })
  it('holds released notes with sustain and preserves physically held notes on pedal up', async () => {
    const h = harness(); await h.engine.enable()
    h.engine.setSustain(true)
    const first = h.engine.noteOn(60)!
    h.engine.noteOff(first)
    h.engine.noteOn(60)
    expect(h.sources[1].stop).not.toHaveBeenCalled()
    expect(h.engine.snapshot()).toMatchObject({ pressed: [60], sustained: [60], sustain: true })
    h.engine.setSustain(false)
    expect(h.sources[1].stop).toHaveBeenCalled()
    expect(h.sources[2].stop).not.toHaveBeenCalled()
    expect(h.engine.snapshot().sustained).toEqual([])
    h.engine.dispose()
  })
  it('preserves a physically held-key highlight after the sample naturally decays', async () => {
    const h = harness(); await h.engine.enable()
    const id = h.engine.noteOn(60)!
    h.sources[1].onended!()
    expect(h.engine.snapshot().pressed).toEqual([60])
    h.engine.noteOff(id)
    expect(h.engine.snapshot().pressed).toEqual([])
    h.engine.dispose()
  })
  it('stops everything on interruption and resumes without downloading again', async () => {
    const h = harness(); await h.engine.enable()
    h.engine.setSustain(true); h.engine.noteOn(60)
    h.context.state = 'interrupted'; h.context.onstatechange!()
    expect(h.engine.snapshot()).toMatchObject({ status: 'suspended', sustain: false, pressed: [], sustained: [] })
    expect(h.sources[1].stop).toHaveBeenCalled()
    await h.engine.enable()
    expect(h.engine.snapshot().status).toBe('ready')
    expect(h.load).toHaveBeenCalledOnce()
    h.engine.dispose()
  })
  it('reports a load failure, retries, and can mute output', async () => {
    const h = harness()
    h.load.mockRejectedValueOnce(new Error('Network unavailable'))
    await h.engine.enable()
    expect(h.engine.snapshot()).toMatchObject({ status: 'error', error: 'Network unavailable' })
    await h.engine.enable()
    expect(h.engine.snapshot().status).toBe('ready')
    h.engine.setVolume(0)
    expect(h.gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 10, 0.015)
    h.engine.dispose()
  })
  it('does not become ready after disposal during sample loading', async () => {
    let finish!: (buffers: Map<number, AudioBuffer>) => void
    const h = harness(() => new Promise(resolve => { finish = resolve }))
    const promise = h.engine.enable()
    await vi.waitFor(() => expect(h.load).toHaveBeenCalledOnce())
    const listener = vi.fn(); h.engine.subscribe(listener)
    h.engine.dispose(); const count = listener.mock.calls.length
    finish(h.buffers); await promise
    expect(listener).toHaveBeenCalledTimes(count)
    expect(h.context.close).toHaveBeenCalledOnce()
  })
  it('uses the native audio clock for scheduled playback and cancels future notes', async () => {
    const h = harness(); await h.engine.enable()
    const cancel = h.engine.play(fixture())
    expect(h.sources[1].start).toHaveBeenCalledWith(10.05)
    expect(h.sources[2].start).toHaveBeenCalledWith(10.55)
    expect(h.sources[9].start).toHaveBeenCalledWith(14.05)
    expect(h.sources[9].stop.mock.calls[0][0]).toBeCloseTo(16.45)
    cancel()
    expect(h.sources[9].stop).toHaveBeenLastCalledWith(10.03)
    expect(h.engine.snapshot().pressed).toEqual([])
    h.engine.dispose()
  })
})

describe('scheduled sustain semantics', () => {
  it('applies pedal changes before note releases at equal positions', () => {
    const doc = fixture()
    doc.music.instruments[0].sustain = [{ at: '1', down: true }, { at: '4', down: false }]
    const notes = planPlayback(doc).notes
    expect(notes.find(n => n.id === 'n1')?.soundReleaseSeconds).toBe(2)
    expect(notes.find(n => n.id === 'n4')?.soundReleaseSeconds).toBe(2)
  })
  it('keeps long held notes after pedal up and clears a final down pedal at the end', () => {
    const doc = fixture()
    doc.music.instruments[0].sustain = [{ at: '0', down: true }, { at: '2', down: false }, { at: '8', down: true }]
    doc.music.parts[1].notes.push({ id: 'bass', pitch: 'C3', at: '0', duration: '6' })
    const notes = planPlayback(doc).notes
    expect(notes.find(n => n.id === 'bass')?.soundReleaseSeconds).toBe(3)
    expect(notes.find(n => n.id === 'n9')?.soundReleaseSeconds).toBe(6)
  })
  it('does not apply one piano pedal to another instrument instance', () => {
    const doc = fixture()
    doc.music.instruments[0].sustain = [{ at: '0', down: true }]
    doc.music.instruments.push({ id: 'second', sound: 'acoustic-grand-piano' })
    doc.music.parts.push({ id: 'second', name: 'Second piano', instrumentId: 'second', notes: [{ id: 'second-note', pitch: 'C4', at: '0', duration: '1' }] })
    const notes = planPlayback(doc).notes
    expect(notes.find(n => n.id === 'n1')?.soundReleaseSeconds).toBe(6)
    expect(notes.find(n => n.id === 'second-note')?.soundReleaseSeconds).toBe(0.5)
  })
  it('rejects an unavailable instrument instead of substituting it', () => {
    const doc = fixture(); doc.music.instruments[0].sound = 'flute'
    expect(() => planPlayback(doc)).toThrow('Only acoustic-grand-piano is installed.')
  })
  it('enforces this piano range without restricting the generic music model', () => {
    const doc = fixture(); doc.music.parts[0].notes[0].pitch = 'C-1'
    expect(() => planPlayback(doc)).toThrow('This piano supports A0–C8.')
  })
})
