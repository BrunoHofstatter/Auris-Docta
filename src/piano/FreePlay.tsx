import { useCallback, useEffect, useRef, useState } from 'react'
import { PianoEngine } from '../audio/PianoEngine'
import type { PianoSnapshot } from '../audio/PianoEngine'
import { formatPitch } from '../music/pitch'
import { COMPUTER_KEYS, INITIAL_OCTAVE, pianoRange } from './layout'
import { PianoKeyboard } from './PianoKeyboard'
import './piano.css'

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

export default function FreePlay() {
  const [saved] = useState(preferences)
  const [octave, setOctave] = useState(saved.octave)
  const [volume, setVolume] = useState(saved.volume)
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

  const selected = [...audio.pressed].sort((a, b) => a - b).map(p => formatPitch(p)).join(' + ')
  return <section className="free-play" aria-labelledby="free-play-title">
    <div className="rotate-message" hidden={!rotate}>
      <span className="rotate-symbol" aria-hidden="true">↻</span>
      <h1 id={rotate ? 'free-play-title' : undefined}>A little more room.</h1>
      <p>Rotate your phone to landscape to play.</p>
      <p className="quiet">Your range and settings will stay here.</p>
      <a className="text-link" href="#/home">Back home →</a>
    </div>
    <div className="piano-content" hidden={rotate}>
      <div className="free-play-heading">
        <div><p className="eyebrow">YOUR PIANO, WHEREVER YOU ARE</p><h1 id={!rotate ? 'free-play-title' : undefined}>Free play<span className="instrument-name">Acoustic piano</span></h1></div>
        <span className={`audio-indicator ${ready ? 'audio-ready' : ''}`} role="status">{ready ? 'Ready to play' : audio.status === 'loading' ? `Loading piano · ${Math.round(audio.loaded / audio.total * 100)}%` : audio.status === 'error' ? 'Sound needs attention' : 'Sound is paused'}</span>
      </div>
      <div className="listening-space">
        {ready ? <div className="played-notes"><span>{selected || 'Follow your ear.'}</span><p>{selected ? 'Hold, listen, explore.' : 'A melody, a chord, a place to begin.'}</p></div> : <div className="enable-audio">
          <button type="button" className="button primary" disabled={audio.status === 'loading'} onClick={() => { void engine.current?.enable() }}>{audio.status === 'loading' ? 'Loading piano…' : audio.status === 'error' ? 'Retry piano' : audio.status === 'suspended' ? 'Resume piano' : 'Enable piano'}<span aria-hidden="true">{audio.status === 'loading' ? '…' : '♪'}</span></button>
          <p className="quiet" role={audio.status === 'error' ? 'alert' : undefined}>{audio.status === 'error' ? audio.error : audio.status === 'loading' ? `${audio.loaded} of ${audio.total} piano samples ready` : 'Tap once to enable sound. Then make it your own.'}</p>
        </div>}
      </div>
      <div className="piano-toolbar" aria-label="Piano controls">
        <label className="volume-control">Volume <input aria-label="Volume" type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={event => { const next = Number(event.target.value) / 100; setVolume(next); engine.current?.setVolume(next) }} /><output>{Math.round(volume * 100)}%</output></label>
        <div className="piano-toggles">
          <button type="button" className="piano-control" aria-pressed={audio.sustain} disabled={!ready} onClick={() => engine.current?.setSustain(!audio.sustain)}><span className="pedal-mark" aria-hidden="true" />Sustain<span className="control-state">{audio.sustain ? 'On' : 'Off'}</span></button>
          <button type="button" className="piano-control" aria-pressed={labels} onClick={() => setLabels(value => !value)}>Note names<span className="control-state">{labels ? 'All' : 'C only'}</span></button>
          <button type="button" className="piano-control stop-sound" disabled={!ready} onClick={stop}>Stop sound <span aria-hidden="true">□</span></button>
        </div>
      </div>
      <div className={`keyboard-frame ${mobile ? 'keyboard-mobile' : 'keyboard-desktop'}`}>
        {mobile && <button className="octave-arrow" type="button" aria-label="Previous octave" disabled={octave === 0} onClick={() => setOctave(value => Math.max(0, value - 1))}><span className="chevron chevron-left" /></button>}
        <PianoKeyboard low={low} high={high} disabled={!ready || rotate} showLabels={labels} pressed={audio.pressed} sustained={audio.sustained} onPress={press} onRelease={release}
          onTap={pitch => { engine.current?.tap(pitch) }} />
        {mobile && <button className="octave-arrow" type="button" aria-label="Next octave" disabled={octave === 7} onClick={() => setOctave(value => Math.min(7, value + 1))}><span className="chevron" /></button>}
      </div>
      <div className="keyboard-caption"><span>{formatPitch(low)} — {formatPitch(high)}{mobile ? '' : ' · 88 keys'}</span><span>{mobile ? 'Use the arrows to explore octaves' : 'Keyboard: A W S E D F T G Y H U J K O L P ; · Esc stops sound'}</span><a className="mobile-credit" href={`${import.meta.env.BASE_URL}audio/piano/CREDITS.md`} target="_blank" rel="noreferrer">Piano credits</a></div>
      <div className="piano-credit">Piano samples by Alexander Holm · <a href={`${import.meta.env.BASE_URL}audio/piano/CREDITS.md`} target="_blank" rel="noreferrer">Credits & license</a></div>
    </div>
  </section>
}
