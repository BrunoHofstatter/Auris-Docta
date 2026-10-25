import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { formatPitch } from '../music/pitch'
import { PianoKeyboard } from './PianoKeyboard'
import { useFreePlayInstrument } from './useFreePlayInstrument'
import type { FreePlayInstrument } from './useFreePlayInstrument'
import './free-play.css'

const CREDITS = `${import.meta.env.BASE_URL}audio/piano/CREDITS.md`

const Icon = {
  stop: <svg className="studio-icon" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="5" width="10" height="10" rx="1.5" fill="currentColor" /></svg>,
  left: <svg className="studio-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>,
  right: <svg className="studio-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>,
  sliders: <svg className="studio-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6.5h14M3 13.5h14" /><circle cx="7.5" cy="6.5" r="2.2" fill="currentColor" stroke="none" /><circle cx="12.5" cy="13.5" r="2.2" fill="currentColor" stroke="none" /></svg>,
  rotate: <svg viewBox="0 0 56 56" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="19" y="6" width="18" height="32" rx="3.5" /><path d="M8 40.5c3 6 9.5 9.5 17 9.5h17" /><path d="m38 45.5 4.5 4.5-4.5 4.5" /></svg>,
}

function Logo() {
  return <svg className="studio-logo" viewBox="0 0 36 36" aria-hidden="true">
    <path d="M1.5 18a16.5 16.5 0 0 1 33 0v11a5.5 5.5 0 0 1-5.5 5.5H7A5.5 5.5 0 0 1 1.5 29z" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="7.5" y="16" width="3" height="11" fill="currentColor" /><rect x="13.5" y="10" width="3" height="17" fill="currentColor" />
    <rect x="19.5" y="13" width="3" height="14" fill="currentColor" /><rect x="25.5" y="18" width="3" height="9" fill="currentColor" />
  </svg>
}

function Brand() {
  return <a className="studio-brand" href="#/home" aria-label="Auris Docta home"><Logo /><span>Auris Docta</span></a>
}

/** Small non-modal disclosure; closes on outside press or Escape. */
function Disclosure({ label, trigger, children }: { label: string; trigger: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const id = useId()
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (root.current?.contains(document.activeElement)) button.current?.focus()
      setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open])
  return <div className="studio-pop" ref={root}>
    <button ref={button} type="button" className="studio-icon-button" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>{trigger}</button>
    <div id={id} className="studio-pop-panel" role="group" aria-label={label} hidden={!open}>{children}</div>
  </div>
}

const WHITE_KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';']
const BLACK_KEYS: [string, number][] = [['W', 0], ['E', 1], ['T', 3], ['Y', 4], ['U', 5], ['O', 7], ['P', 8]]

function Help({ mobile }: { mobile: boolean }) {
  return <div className="studio-help">
    {mobile ? <ul>
      <li>Use the arrows to move by octave.</li>
      <li>Hold several keys for a chord, or slide to glide.</li>
      <li>Stop sound silences everything at once.</li>
    </ul> : <>
      <div className="studio-keymap" role="img" aria-label="Computer keys A W S E D F T G Y H U J K O L P semicolon play upward from C">
        {BLACK_KEYS.map(([key, gap]) => <kbd key={key} className="is-black" style={{ gridColumn: `${gap * 2 + 2} / span 2` }}>{key}</kbd>)}
        {WHITE_KEYS.map((key, index) => <kbd key={key} style={{ gridColumn: `${index * 2 + 1} / span 2` }}>{key}</kbd>)}
      </div>
      <ul>
        <li>Computer keys play upward from C. Click or drag across the keys.</li>
        <li><kbd>Esc</kbd> stops all sound.</li>
      </ul>
    </>}
    <p className="studio-credit"><span>Piano samples by Alexander Holm</span><a href={CREDITS} target="_blank" rel="noreferrer">Credits &amp; license</a></p>
  </div>
}

function Volume({ inst }: { inst: FreePlayInstrument }) {
  const value = Math.round(inst.volume * 100)
  return <label className="studio-volume">
    <input type="range" min="0" max="100" value={value} aria-label="Volume" style={{ '--studio-fill': `${value}%` } as CSSProperties}
      onChange={event => inst.setVolume(Number(event.target.value) / 100)} />
    <output className="studio-num" aria-hidden="true">{value}</output>
  </label>
}

function NamesSegment({ inst }: { inst: FreePlayInstrument }) {
  return <div className="studio-seg" role="group" aria-label="Note names">
    <button type="button" aria-pressed={!inst.labels} onClick={() => inst.setLabels(false)}>C only</button>
    <button type="button" aria-pressed={inst.labels} onClick={() => inst.setLabels(true)}>All</button>
  </div>
}

function OctaveButton({ inst, step }: { inst: FreePlayInstrument; step: -1 | 1 }) {
  return <button type="button" className="studio-oct studio-octave-side" aria-label={step < 0 ? 'Previous octave' : 'Next octave'}
    disabled={step < 0 ? inst.octave === 0 : inst.octave === 7}
    onClick={() => inst.setOctave(value => Math.min(7, Math.max(0, value + step)))}>{step < 0 ? Icon.left : Icon.right}</button>
}

function Keyboard({ inst }: { inst: FreePlayInstrument }) {
  return <PianoKeyboard low={inst.low} high={inst.high} disabled={!inst.ready || inst.rotate} showLabels={inst.labels}
    pressed={inst.audio.pressed} sustained={inst.audio.sustained} onPress={inst.press} onRelease={inst.release} onTap={inst.tap} />
}

/** Enable → loading progress → retry/resume. Hidden once the piano is ready. */
function AudioGate({ inst }: { inst: FreePlayInstrument }) {
  const { audio } = inst
  if (audio.status === 'loading') {
    const percent = audio.total ? Math.round(audio.loaded / audio.total * 100) : 0
    return <div className="studio-gate" role="status">
      <span className="studio-gate-text">Loading piano <span className="studio-num">{percent}%</span></span>
      <span className="studio-progress" role="progressbar" aria-label="Piano samples loaded" aria-valuemin={0} aria-valuemax={audio.total} aria-valuenow={audio.loaded}><i style={{ width: `${percent}%` }} /></span>
    </div>
  }
  const error = audio.status === 'error'
  return <div className="studio-gate">
    <button type="button" className="studio-enable" onClick={inst.enable}>
      <span className="studio-enable-mark" aria-hidden="true" />{error ? 'Retry piano' : audio.status === 'suspended' ? 'Resume piano' : 'Enable piano'}
    </button>
    {error && <p className="studio-gate-error" role="alert" title={audio.error}>{audio.error || 'The piano could not load.'}</p>}
  </div>
}

export default function FreePlay() {
  const inst = useFreePlayInstrument()
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = 'studio'
    return () => { delete root.dataset.theme }
  }, [])
  if (inst.rotate) return <RotateScreen />
  const { mobile, ready, audio } = inst
  const notes = [...audio.pressed].sort((a, b) => a - b).map(pitch => formatPitch(pitch))
  return <div className={`studio${mobile ? ' is-touch' : ''}`}>
    <Brand />
    <h1 className="studio-sr">Free play</h1>
    <div className="studio-actions">
      <Disclosure label="Settings" trigger={Icon.sliders}>
        <div className="studio-settings-pane">
          <div className="studio-settings-row"><span>Volume</span><Volume inst={inst} /></div>
          <div className="studio-settings-row"><span>Note names</span><NamesSegment inst={inst} /></div>
        </div>
      </Disclosure>
      <Disclosure label="Help and credits" trigger={<span aria-hidden="true">?</span>}><Help mobile={mobile} /></Disclosure>
    </div>
    <div className="studio-readout-area">{ready && <p className="studio-readout">{notes.join('  ')}</p>}</div>
    <div className="studio-board">
      {mobile && <OctaveButton inst={inst} step={-1} />}
      <div className="studio-case">
        <Keyboard inst={inst} />
        {!ready && <div className="studio-gate-overlay"><AudioGate inst={inst} /></div>}
      </div>
      {mobile && <OctaveButton inst={inst} step={1} />}
    </div>
    <div className="studio-controls" role="group" aria-label="Piano controls">
      <button type="button" className="studio-sustain" aria-pressed={audio.sustain} disabled={!ready} onClick={() => inst.setSustain(!audio.sustain)}><span className="studio-lamp" aria-hidden="true" />Sustain</button>
      <button type="button" className="studio-stop" aria-label="Stop sound" disabled={!ready} onClick={inst.stop}>{Icon.stop}<span>Stop</span></button>
    </div>
  </div>
}

function RotateScreen() {
  return <div className="studio is-touch studio-rotate-screen">
    <Brand />
    <div className="studio-rotate">
      {Icon.rotate}
      <h1>Rotate to landscape to play</h1>
      <p>Your range and settings stay as they are.</p>
    </div>
  </div>
}
