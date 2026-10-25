import { useCallback, useEffect, useRef, useState } from 'react'
import { PianoEngine } from '../audio/PianoEngine'
import type { PianoSnapshot } from '../audio/PianoEngine'
import { COMPUTER_KEYS, INITIAL_OCTAVE, pianoRange } from './layout'

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

function preferences() {
  try {
    const data = JSON.parse(localStorage.getItem('auris-free-play') ?? '{}')
    return {
      octave: Number.isInteger(data.octave) && data.octave >= 0 && data.octave <= 7 ? data.octave as number : INITIAL_OCTAVE,
      volume: Number.isFinite(data.volume) && data.volume >= 0 && data.volume <= 1 ? data.volume as number : 0.65,
      labels: data.labels === true,
    }
  } catch { return { octave: INITIAL_OCTAVE, volume: 0.65, labels: false } }
}
const INITIAL_AUDIO: PianoSnapshot = { status: 'idle', loaded: 0, total: 30, error: '', pressed: [], sustained: [], sustain: false, volume: 0.65 }

/**
 * Free play instrument: audio engine lifecycle, input ownership, preferences,
 * hardware keyboard mapping, and interruption cleanup, separate from the
 * Free play screen's visual components.
 */
export function useFreePlayInstrument() {
  const [saved] = useState(preferences)
  const [octave, setOctave] = useState(saved.octave)
  const [volume, setVolumeState] = useState(saved.volume)
  const [labels, setLabels] = useState(saved.labels)
  const [audio, setAudio] = useState(INITIAL_AUDIO)
  const engine = useRef<PianoEngine | null>(null)
  const owners = useRef(new Map<string, string>())
  const mobile = useMedia('(pointer: coarse) and (max-width: 1200px)')
  const portrait = useMedia('(orientation: portrait)')
  const rotate = mobile && portrait
  const [low, high] = pianoRange(mobile, octave)
  const ready = audio.status === 'ready'

  const stop = useCallback(() => { owners.current.clear(); engine.current?.stopAll() }, [])
  const press = useCallback((pitch: number, owner: string) => {
    if (owners.current.has(owner)) return
    const id = engine.current?.noteOn(pitch)
    if (id) owners.current.set(owner, id)
  }, [])
  const release = useCallback((owner: string) => {
    const id = owners.current.get(owner)
    if (id) engine.current?.noteOff(id)
    owners.current.delete(owner)
  }, [])
  const setVolume = useCallback((next: number) => { setVolumeState(next); engine.current?.setVolume(next) }, [])
  const setSustain = useCallback((on: boolean) => { engine.current?.setSustain(on) }, [])
  const tap = useCallback((pitch: number) => { engine.current?.tap(pitch) }, [])
  const enable = useCallback(() => { void engine.current?.enable() }, [])

  useEffect(() => {
    const piano = new PianoEngine()
    engine.current = piano
    piano.setVolume(saved.volume)
    const unsubscribe = piano.subscribe(snapshot => {
      if (snapshot.status !== 'ready') owners.current.clear()
      setAudio(snapshot)
    })
    const visibility = () => { if (document.hidden) stop() }
    window.addEventListener('blur', stop)
    window.addEventListener('pagehide', stop)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      unsubscribe()
      window.removeEventListener('blur', stop)
      window.removeEventListener('pagehide', stop)
      document.removeEventListener('visibilitychange', visibility)
      owners.current.clear()
      piano.dispose()
      engine.current = null
    }
  }, [saved.volume, stop])
  useEffect(() => { stop() }, [mobile, rotate, octave, stop])
  useEffect(() => {
    try { localStorage.setItem('auris-free-play', JSON.stringify({ octave, volume, labels })) } catch { /* Playing remains available without storage. */ }
  }, [octave, volume, labels])
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (rotate || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.code === 'Escape') { stop(); return }
      const base = COMPUTER_KEYS[event.code]
      if (base === undefined) return
      event.preventDefault()
      if (!event.repeat) press(base + (mobile ? (octave - 4) * 12 : 0), `computer-${event.code}`)
    }
    const up = (event: KeyboardEvent) => release(`computer-${event.code}`)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [mobile, octave, press, release, rotate, stop])

  return { octave, setOctave, volume, setVolume, labels, setLabels, audio, mobile, rotate, low, high, ready, stop, press, release, tap, enable, setSustain }
}

export type FreePlayInstrument = ReturnType<typeof useFreePlayInstrument>
