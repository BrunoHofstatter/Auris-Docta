import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { formatPitch } from '../music/pitch'
import { PianoKeyboard } from '../piano/PianoKeyboard'
import { useFreePlayInstrument } from '../piano/useFreePlayInstrument'
import type { FreePlayInstrument } from '../piano/useFreePlayInstrument'
import '../piano/piano.css'
import './design.css'

/**
 * Free play design prototypes (#/design/a, #/design/b, #/design/c).
 * One shared instrument hook and keyboard; three scoped visual compositions.
 */
export type DesignVariant = 'a' | 'b' | 'c'
type LayoutProps = { inst: FreePlayInstrument; notes: string[] }

const CREDITS = `${import.meta.env.BASE_URL}audio/piano/CREDITS.md`

const Icon = {
  stop: <svg className="dfp-icon" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="5" width="10" height="10" rx="1.5" fill="currentColor" /></svg>,
  left: <svg className="dfp-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>,
  right: <svg className="dfp-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>,
  sliders: <svg className="dfp-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6.5h14M3 13.5h14" /><circle cx="7.5" cy="6.5" r="2.2" fill="currentColor" stroke="none" /><circle cx="12.5" cy="13.5" r="2.2" fill="currentColor" stroke="none" /></svg>,
  volume: <svg className="dfp-icon dfp-volume-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8v4h3l4 3.5v-11l-4 3.5z" fill="currentColor" /><path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5.5a6.5 6.5 0 0 1 0 9" /></svg>,
  rotate: <svg viewBox="0 0 56 56" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="19" y="6" width="18" height="32" rx="3.5" /><path d="M8 40.5c3 6 9.5 9.5 17 9.5h17" /><path d="m38 45.5 4.5 4.5-4.5 4.5" /></svg>,
}

function Logo() {
  return <svg className="dfp-logo" viewBox="0 0 36 36" aria-hidden="true">
    <path d="M1.5 18a16.5 16.5 0 0 1 33 0v11a5.5 5.5 0 0 1-5.5 5.5H7A5.5 5.5 0 0 1 1.5 29z" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="7.5" y="16" width="3" height="11" fill="currentColor" /><rect x="13.5" y="10" width="3" height="17" fill="currentColor" />
    <rect x="19.5" y="13" width="3" height="14" fill="currentColor" /><rect x="25.5" y="18" width="3" height="9" fill="currentColor" />
  </svg>
}

function Brand() {
  return <a className="dfp-brand" href="#/home" aria-label="Auris Docta home"><Logo /><span>Auris Docta</span></a>
}

/** Small non-modal disclosure; closes on outside press or Escape. */
function Disclosure({ label, trigger, triggerClassName = '', className = '', children }: { label: string; trigger: ReactNode; triggerClassName?: string; className?: string; children: ReactNode }) {
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
  return <div className={`dfp-pop ${className}`} ref={root}>
    <button ref={button} type="button" className={`dfp-pop-trigger ${triggerClassName}`} aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>{trigger}</button>
    <div id={id} className="dfp-pop-panel" role="group" aria-label={label} hidden={!open}>{children}</div>
  </div>
}

const WHITE_KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';']
const BLACK_KEYS: [string, number][] = [['W', 0], ['E', 1], ['T', 3], ['Y', 4], ['U', 5], ['O', 7], ['P', 8]]

function Help({ mobile }: { mobile: boolean }) {
  return <div className="dfp-help">
    {mobile ? <ul>
      <li>Use the arrows to move by octave.</li>
      <li>Hold several keys for a chord, or slide to glide.</li>
      <li>Stop sound silences everything at once.</li>
    </ul> : <>
      <div className="dfp-keymap" role="img" aria-label="Computer keys A W S E D F T G Y H U J K O L P semicolon play upward from C">
        {BLACK_KEYS.map(([key, gap]) => <kbd key={key} className="is-black" style={{ gridColumn: `${gap * 2 + 2} / span 2` }}>{key}</kbd>)}
        {WHITE_KEYS.map((key, index) => <kbd key={key} style={{ gridColumn: `${index * 2 + 1} / span 2` }}>{key}</kbd>)}
      </div>
      <ul>
        <li>Computer keys play upward from C. Click or drag across the keys.</li>
        <li><kbd>Esc</kbd> stops all sound.</li>
      </ul>
    </>}
    <p className="dfp-credit"><span>Piano samples by Alexander Holm</span><a href={CREDITS} target="_blank" rel="noreferrer">Credits &amp; license</a></p>
  </div>
}

function Volume({ inst }: { inst: FreePlayInstrument }) {
  const value = Math.round(inst.volume * 100)
  return <label className="dfp-volume">
    {Icon.volume}<span className="dfp-volume-label">Volume</span>
    <input type="range" min="0" max="100" value={value} aria-label="Volume" style={{ '--dfp-fill': `${value}%` } as CSSProperties}
      onChange={event => inst.setVolume(Number(event.target.value) / 100)} />
    <output className="dfp-num" aria-hidden="true">{value}</output>
  </label>
}

function NamesSegment({ inst }: { inst: FreePlayInstrument }) {
  return <div className="dfp-seg" role="group" aria-label="Note names">
    <button type="button" aria-pressed={!inst.labels} onClick={() => inst.setLabels(false)}>C only</button>
    <button type="button" aria-pressed={inst.labels} onClick={() => inst.setLabels(true)}>All</button>
  </div>
}

function OctaveButton({ inst, step, className = '' }: { inst: FreePlayInstrument; step: -1 | 1; className?: string }) {
  return <button type="button" className={`dfp-oct ${className}`} aria-label={step < 0 ? 'Previous octave' : 'Next octave'}
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
    return <div className="dfp-gate is-loading" role="status">
      <span className="dfp-gate-text"><span className="dfp-gate-word">Loading piano </span><span className="dfp-num">{percent}%</span></span>
      <span className="dfp-progress" role="progressbar" aria-label="Piano samples loaded" aria-valuemin={0} aria-valuemax={audio.total} aria-valuenow={audio.loaded}><i style={{ width: `${percent}%` }} /></span>
    </div>
  }
  const error = audio.status === 'error'
  return <div className="dfp-gate">
    <button type="button" className="dfp-enable" onClick={inst.enable}>
      <span className="dfp-enable-mark" aria-hidden="true" />{error ? 'Retry piano' : audio.status === 'suspended' ? 'Resume piano' : 'Enable piano'}
    </button>
    {error && <p className="dfp-gate-error" role="alert" title={audio.error}>{audio.error || 'The piano could not load.'}</p>}
  </div>
}

/* A — Warm editorial: readout as a title above the keys, typographic controls set beneath like a colophon. */
function LayoutA({ inst, notes }: LayoutProps) {
  const { mobile, ready, audio } = inst
  return <div className={`dfp dfp-a${mobile ? ' is-touch' : ''}`}>
    <Brand />
    <div className="dfp-a-end">
      <h1 className="dfp-a-title">Free play</h1>
      <Disclosure label="Help and credits" trigger="Help" triggerClassName="dfp-a-link"><Help mobile={mobile} /></Disclosure>
    </div>
    <div className="dfp-a-lead">{ready ? <p className="dfp-readout">{notes.join(' · ')}</p> : <AudioGate inst={inst} />}</div>
    <div className="dfp-board">
      {mobile && <OctaveButton inst={inst} step={-1} />}
      <Keyboard inst={inst} />
      {mobile && <OctaveButton inst={inst} step={1} />}
    </div>
    <div className="dfp-a-controls" role="group" aria-label="Piano controls">
      <div className="dfp-a-group">
        <button type="button" className="dfp-a-toggle" aria-pressed={audio.sustain} disabled={!ready} onClick={() => inst.setSustain(!audio.sustain)}><span className="dfp-a-switch" aria-hidden="true" />Sustain</button>
        <button type="button" className="dfp-a-text" disabled={!ready} onClick={inst.stop}>{Icon.stop}Stop sound</button>
      </div>
      <div className="dfp-a-group">
        <Volume inst={inst} />
        <button type="button" className="dfp-a-text dfp-a-names" aria-pressed={inst.labels} onClick={() => inst.setLabels(value => !value)}>Note names <em>{inst.labels ? 'all' : 'C only'}</em></button>
      </div>
    </div>
  </div>
}

/* B — Cool precision: one attached control panel sits on the instrument like a name board. */
function LayoutB({ inst, notes }: LayoutProps) {
  const { mobile, ready, audio, low, high } = inst
  return <div className={`dfp dfp-b${mobile ? ' is-touch' : ''}`}>
    <div className="dfp-b-instrument">
      <div className="dfp-b-panel">
        <Brand />
        <div className="dfp-b-cell">
          <h1 className="dfp-b-mode">Free play</h1>
          {mobile && <div className="dfp-b-stepper" role="group" aria-label="Octave">
            <OctaveButton inst={inst} step={-1} />
            <span className="dfp-b-range dfp-num">{formatPitch(low)}–{formatPitch(high)}</span>
            <OctaveButton inst={inst} step={1} />
          </div>}
        </div>
        <div className="dfp-b-display">{ready ? <p className="dfp-readout">{notes.join('  ')}</p> : <AudioGate inst={inst} />}</div>
        <div className="dfp-b-cell dfp-b-actions">
          <button type="button" className="dfp-b-btn" aria-pressed={audio.sustain} disabled={!ready} onClick={() => inst.setSustain(!audio.sustain)}><span className="dfp-b-led" aria-hidden="true" />Sustain</button>
          <button type="button" className="dfp-b-btn dfp-b-stop" aria-label="Stop sound" disabled={!ready} onClick={inst.stop}>{Icon.stop}<span className="dfp-b-stop-text">Stop</span></button>
          <Disclosure label="Settings and help" trigger={Icon.sliders} triggerClassName="dfp-b-btn">
            <div className="dfp-b-pane">
              <div className="dfp-b-row"><span>Volume</span><Volume inst={inst} /></div>
              <div className="dfp-b-row"><span>Note names</span><NamesSegment inst={inst} /></div>
              <Help mobile={mobile} />
            </div>
          </Disclosure>
        </div>
      </div>
      <Keyboard inst={inst} />
    </div>
    {!mobile && <div className="dfp-b-scale dfp-num" aria-hidden="true"><span>{formatPitch(low)}</span><span>88 keys</span><span>{formatPitch(high)}</span></div>}
  </div>
}

/* C — Dark studio: centred instrument in a case, illuminated readout above and a pedal row below. */
function LayoutC({ inst, notes }: LayoutProps) {
  const { mobile, ready, audio } = inst
  return <div className={`dfp dfp-c${mobile ? ' is-touch' : ''}`}>
    <Brand />
    <h1 className="dfp-sr">Free play</h1>
    <div className="dfp-c-end">
      <Disclosure label="Settings" trigger={Icon.sliders} triggerClassName="dfp-c-icon">
        <div className="dfp-c-pane">
          <div className="dfp-c-row"><span>Volume</span><Volume inst={inst} /></div>
          <div className="dfp-c-row"><span>Note names</span><NamesSegment inst={inst} /></div>
        </div>
      </Disclosure>
      <Disclosure label="Help and credits" trigger={<span aria-hidden="true">?</span>} triggerClassName="dfp-c-icon"><Help mobile={mobile} /></Disclosure>
    </div>
    <div className="dfp-c-read">{ready && <p className="dfp-readout">{notes.join('  ')}</p>}</div>
    <div className="dfp-c-board">
      {mobile && <OctaveButton inst={inst} step={-1} className="dfp-c-cheek" />}
      <div className="dfp-c-case">
        <Keyboard inst={inst} />
        {!ready && <div className="dfp-c-gate"><AudioGate inst={inst} /></div>}
      </div>
      {mobile && <OctaveButton inst={inst} step={1} className="dfp-c-cheek" />}
    </div>
    <div className="dfp-c-pedals" role="group" aria-label="Piano controls">
      <button type="button" className="dfp-c-pedal" aria-pressed={audio.sustain} disabled={!ready} onClick={() => inst.setSustain(!audio.sustain)}><span className="dfp-c-lamp" aria-hidden="true" />Sustain</button>
      <button type="button" className="dfp-c-stop" aria-label="Stop sound" disabled={!ready} onClick={inst.stop}>{Icon.stop}<span>Stop</span></button>
    </div>
  </div>
}

function RotateScreen({ variant }: { variant: DesignVariant }) {
  return <div className={`dfp dfp-${variant} is-touch dfp-rotate-screen`}>
    <Brand />
    <div className="dfp-rotate">
      {Icon.rotate}
      <h1>Rotate to landscape to play</h1>
      <p>Your range and settings stay as they are.</p>
    </div>
  </div>
}

const LAYOUTS = { a: LayoutA, b: LayoutB, c: LayoutC }

export default function DesignFreePlay({ variant }: { variant: DesignVariant }) {
  const inst = useFreePlayInstrument()
  useEffect(() => {
    const root = document.documentElement
    root.dataset.dfp = variant
    return () => { delete root.dataset.dfp }
  }, [variant])
  if (inst.rotate) return <RotateScreen variant={variant} />
  const notes = [...inst.audio.pressed].sort((a, b) => a - b).map(pitch => formatPitch(pitch))
  const Layout = LAYOUTS[variant]
  return <Layout inst={inst} notes={notes} />
}
