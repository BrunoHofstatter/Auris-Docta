import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Brand from '../components/StudioBrand'
import { PianoKeyboard } from '../piano/PianoKeyboard'
import { useFreePlayInstrument } from '../piano/useFreePlayInstrument'
import { formatPitch } from '../music/pitch'
import { solutionGroups } from '../music/timeline'
import type { MusicDocument } from '../music/model'
import { alignAnswers, compareGroup, parseAnswer, submittedGroups } from './answers'
import type { AlignedGroup } from './answers'
import { exerciseLength, generateExercise, readSettings } from './generator'
import type { Settings } from './generator'
import GroupWindow from './GroupWindow'
import Setup, { Segments } from './Setup'
import Review, { PitchChips } from './Review'
import { usePlayback } from './usePlayback'
import '../piano/free-play.css'
import './practice.css'

interface Exercise { document: MusicDocument; settings: Settings }
interface Result { rows: AlignedGroup[]; revealed: boolean }
const secondsText = (value: number) => `${Number(value.toFixed(2))}s`

export default function Practice() {
  const [settings, setSettings] = useState(readSettings)
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [setup, setSetup] = useState(true)
  const [groups, setGroups] = useState<number[][]>([[]])
  const [current, setCurrent] = useState(0)
  const [sound, setSound] = useState(false)
  const [message, setMessage] = useState('')
  const [stepStatus, setStepStatus] = useState<'answering' | 'wrong' | 'correct'>('answering')
  const [showCurrent, setShowCurrent] = useState(false)
  const [assisted, setAssisted] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [undo, setUndo] = useState<{ groups: number[][]; current: number } | null>(null)
  const [rate, setRate] = useState(1)
  const [loop, setLoop] = useState(false)
  const [loopFrom, setLoopFrom] = useState(1)
  const [loopTo, setLoopTo] = useState(10)
  const [typed, setTyped] = useState('')
  const [options, setOptions] = useState(false)
  const optionsRef = useRef<HTMLDetailsElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const step = exercise?.settings.mode === 'step' && !result
  const selected = groups[current] ?? []
  const edit = !setup && !result && !(step && stepStatus === 'correct')
  const toggle = useCallback((pitch: number) => {
    if (!edit) return
    setGroups(previous => previous.map((group, index) => index === current ? group.includes(pitch) ? group.filter(p => p !== pitch) : [...group, pitch].sort((a, b) => a - b) : group))
    setMessage(''); setStepStatus('answering'); setUndo(null)
  }, [current, edit])
  const inst = useFreePlayInstrument({ keyboardMode: setup || result || options || !edit && !sound ? 'off' : sound ? 'sound' : 'answer', onSelect: toggle })
  const expected = useMemo(() => exercise ? solutionGroups(exercise.document).map(group => group.pitches) : [], [exercise])
  const interval = exercise ? 60 / exercise.settings.bpm : 1
  const duration = expected.length * interval
  const start = step ? current * interval : loop ? (loopFrom - 1) * interval : 0
  const end = step ? (current + 1) * interval : loop ? loopTo * interval : duration
  const playback = usePlayback(inst.engine, exercise?.document ?? null, start, end, rate, loop, inst.ready && !setup && !inst.rotate)
  useEffect(() => {
    document.documentElement.dataset.theme = 'studio'
    return () => { delete document.documentElement.dataset.theme }
  }, [])
  useEffect(() => {
    try { localStorage.setItem('auris-practice-setup', JSON.stringify(settings)) } catch { /* No storage is required to practice. */ }
  }, [settings])
  useEffect(() => { setTyped(selected.map(p => formatPitch(p)).join(' ')) }, [groups, current]) // Keep the typed editor in sync with the piano.
  useEffect(() => {
    if (!inst.rotate && !setup) heading.current?.focus()
  }, [setup, result, inst.rotate])
  useEffect(() => {
    if (!options) return
    const outside = (event: PointerEvent) => { if (!optionsRef.current?.contains(event.target as Node)) setOptions(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOptions(false); optionsRef.current?.querySelector('summary')?.focus() } }
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [options])
  const reset = () => {
    playback.stop(); inst.stop(); setGroups([[]]); setCurrent(0); setResult(null); setShowCurrent(false)
    setStepStatus('answering'); setMessage(''); setSound(false); setUndo(null); setLoop(false); setRate(1); setOptions(false)
    setAssisted(false)
  }
  const begin = () => {
    try {
      const document = generateExercise(settings)
      reset(); setExercise({ document, settings: structuredClone(settings) }); setSetup(false)
      inst.setOctave(Math.max(0, Math.min(7, Math.min(...settings.octaves))))
      setLoopFrom(1); setLoopTo(exerciseLength(settings).items)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not generate this exercise.') }
  }
  const newExercise = () => {
    if (!exercise) return
    try {
      const document = generateExercise(exercise.settings)
      reset(); setExercise({ ...exercise, document }); setLoopFrom(1); setLoopTo(exerciseLength(exercise.settings).items)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not generate this exercise.') }
  }
  const enterSetup = () => { playback.pause(); inst.stop(); setOptions(false); setMessage(''); setSetup(true) }
  const nextGroup = () => {
    if (current === groups.length - 1) {
      if (groups.length >= 400) { setMessage('At most 400 answer groups per attempt.'); return }
      setGroups(previous => [...previous, []])
    }
    setCurrent(current + 1); setMessage(''); setUndo(null)
  }
  const submit = () => {
    try {
      const answer = submittedGroups(groups)
      playback.stop(); inst.stop(); setResult({ rows: alignAnswers(expected, answer), revealed: false }); setOptions(false); setMessage('')
    } catch (error) { setMessage((error as Error).message) }
  }
  const checkStep = () => {
    if (!selected.length) { setMessage('Enter an answer before checking.'); return }
    const correct = compareGroup(expected[current], selected).exact
    setStepStatus(correct ? 'correct' : 'wrong'); setMessage(correct ? 'Correct' : 'Incorrect. Try again.')
  }
  const nextStep = () => {
    playback.stop(); inst.stop()
    if (current === expected.length - 1) { setResult({ rows: alignAnswers(expected, groups), revealed: false }); setMessage(''); return }
    setCurrent(current + 1); setGroups(previous => [...previous, []]); setStepStatus('answering'); setMessage(''); setShowCurrent(false); setSound(false)
  }
  const reveal = () => {
    setAssisted(true)
    if (step) setShowCurrent(true)
    else { playback.stop(); inst.stop(); setResult({ rows: alignAnswers(expected, groups.filter(g => g.length)), revealed: true }) }
  }
  const applyTyped = () => {
    try { const pitches = parseAnswer(typed); setGroups(previous => previous.map((g, i) => i === current ? pitches : g)); setMessage(''); setStepStatus('answering'); setUndo(null); setOptions(false) }
    catch (error) { setMessage((error as Error).message) }
  }
  const stopAll = () => { playback.stop(); inst.stop() }
  const audioLabel = inst.audio.status === 'loading' ? `Loading piano ${Math.round(inst.audio.loaded / inst.audio.total * 100)}%`
    : inst.audio.status === 'error' ? 'Retry piano' : inst.audio.status === 'suspended' ? 'Resume piano' : 'Enable piano'
  const toolbar = exercise && <div className="practice-transport" role="group" aria-label="Exercise playback">
    {inst.ready ? <>
      <button className="practice-button" onClick={() => playback.playing ? playback.pause() : playback.play()}>{playback.playing ? 'Pause' : playback.position >= end - 0.001 ? 'Replay' : 'Play'}</button>
      <button className="practice-button" onClick={() => playback.play(start)} aria-label={step ? 'Replay current item' : 'Replay exercise'}>↺</button>
    </> : <button className="practice-button" disabled={inst.audio.status === 'loading'} onClick={() => { void inst.enable() }}>{audioLabel}</button>}
    <button className="practice-button" onClick={stopAll}>Stop</button>
    <input type="range" aria-label="Playback position" min={start} max={end || 1} step="0.01" value={Math.min(end, Math.max(start, playback.position))} onChange={event => playback.seek(Number(event.target.value))} />
    <span className="practice-time studio-num">{secondsText(Math.max(0, playback.position - start))} / {secondsText(end - start)}</span>
  </div>
  const audioError = inst.audio.status === 'error' ? inst.audio.error : playback.error
  return <div className={`studio practice${inst.mobile ? ' is-touch' : ''}${setup ? ' is-setup' : result ? ' is-review' : ' is-session'}`}>
    <header className="practice-header"><Brand />
      {!setup && <><h1 ref={heading} tabIndex={-1} className="practice-session-title">{result ? 'Review' : step ? `Item ${current + 1} / ${expected.length}` : 'Full sequence'}</h1>
        <div className="practice-header-actions"><button className="practice-button" onClick={enterSetup}>Setup</button>
          <details className="practice-options" ref={optionsRef} open={options} onToggle={event => setOptions(event.currentTarget.open)}>
            <summary className="practice-button" aria-label="Practice options">•••</summary>
            <div className="practice-options-panel">
              <label>Volume<input type="range" aria-label="Volume" min="0" max="100" value={Math.round(inst.volume * 100)} onChange={event => inst.setVolume(Number(event.target.value) / 100)} /></label>
              <label className="practice-checkbox"><input type="checkbox" checked={inst.labels} onChange={event => inst.setLabels(event.target.checked)} />Note names</label>
              <label>Playback speed<select value={rate} onChange={event => setRate(Number(event.target.value))}><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label>
              {!step && <>
                <label className="practice-checkbox"><input type="checkbox" checked={loop} onChange={event => setLoop(event.target.checked)} />Loop selected items</label>
                <div className="practice-field-pair"><label>From item<input type="number" min="1" max={loopTo} value={loopFrom} onChange={event => { const v = event.target.valueAsNumber; if (Number.isInteger(v) && v >= 1 && v <= loopTo) setLoopFrom(v) }} /></label>
                  <label>To item<input type="number" min={loopFrom} max={expected.length} value={loopTo} onChange={event => { const v = event.target.valueAsNumber; if (Number.isInteger(v) && v >= loopFrom && v <= expected.length) setLoopTo(v) }} /></label></div>
              </>}
              {edit && <form onSubmit={event => { event.preventDefault(); applyTyped() }}><label>Typed answer<input aria-label="Typed answer" value={typed} placeholder="C4 E4 G4" onChange={event => setTyped(event.target.value)} /></label><button className="practice-button" type="submit">Apply notes</button></form>}
              <p className="practice-muted">Answers are silent. Use Sound to explore. Right-click or hold a group to insert or delete.</p>
              <a href={`${import.meta.env.BASE_URL}audio/piano/CREDITS.md`} target="_blank" rel="noreferrer">Piano credits</a>
            </div>
          </details>
        </div></>}
    </header>
    {setup ? <>
      <Setup settings={settings} onChange={setSettings} onStart={begin} active={!!exercise} onReturn={() => setSetup(false)} />
      {message && <p className="practice-error" role="alert">{message}</p>}
    </> : inst.rotate ? <div className="practice-rotate"><span aria-hidden="true">↻</span><h2>Rotate to landscape to practice</h2><p>Your exercise and answer stay here.</p></div> : <>
      {!result && toolbar}
      {result && exercise ? <>
        <Review document={exercise.document} rows={result.rows} position={playback.position} revealed={result.revealed} assisted={assisted} transport={toolbar} />
        <footer className="practice-footer"><button className="practice-button" onClick={() => { reset(); setAssisted(true) }}>Try again</button><button className="practice-button is-primary" onClick={newExercise}>New exercise →</button></footer>
      </> : <>
        <div className="practice-answer-area">
          {!step && <GroupWindow groups={groups} current={current} onSelect={index => { setCurrent(index); setMessage('') }}
            onInsert={index => { if (groups.length >= 400) { setMessage('At most 400 answer groups per attempt.'); return } setGroups(previous => [...previous.slice(0, index), [], ...previous.slice(index)]); setCurrent(index); setMessage(''); setUndo(null) }}
            onDelete={index => { setUndo({ groups: structuredClone(groups), current }); const next = groups.filter((_, i) => i !== index); setGroups(next.length ? next : [[]]); setCurrent(Math.max(0, Math.min(current - (index < current ? 1 : 0), next.length - 1))); setMessage('Group deleted.'); }} />}
          <div className="practice-answer-summary"><span className="practice-muted">{step ? 'Your answer' : `Group ${current + 1}`}</span><PitchChips pitches={selected} />
            {!selected.length && <span className="practice-muted">Select notes on the piano</span>}
            {showCurrent && <span className="practice-step-solution">Solution: <PitchChips pitches={expected[current]} /></span>}
          </div>
        </div>
        <div className="practice-keyboard studio-board">
          {inst.mobile && <div className="practice-octave-column"><button className="studio-oct studio-octave-side" aria-label="Previous octave" disabled={inst.octave === 0} onClick={() => inst.setOctave(value => value - 1)}>‹</button>
            <span className="practice-offscreen" aria-label="Selected notes below window">{selected.filter(p => p < inst.low).map(p => formatPitch(p)).join(' ')}</span></div>}
          <div className="studio-case"><PianoKeyboard low={inst.low} high={inst.high} disabled={!edit && !sound || sound && !inst.ready}
            showLabels={inst.labels} pressed={sound ? inst.audio.pressed : []} sustained={sound ? inst.audio.sustained : []}
            selected={sound ? [] : selected} interaction={sound ? 'play' : 'select'} onSelect={toggle} onPress={inst.press} onRelease={inst.release} onTap={inst.tap} /></div>
          {inst.mobile && <div className="practice-octave-column"><button className="studio-oct studio-octave-side" aria-label="Next octave" disabled={inst.octave === 7} onClick={() => inst.setOctave(value => value + 1)}>›</button>
            <span className="practice-offscreen" aria-label="Selected notes above window">{selected.filter(p => p > inst.high).map(p => formatPitch(p)).join(' ')}</span></div>}
        </div>
        <footer className="practice-footer">
          <div className="practice-piano-mode"><Segments label="Piano mode" value={sound ? 'sound' : 'answer'} options={[{ value: 'answer', label: 'Answer' }, { value: 'sound', label: 'Sound' }]} onChange={value => { inst.stopLive(); setSound(value === 'sound') }} />
            {sound && <button className="practice-button practice-sustain" aria-pressed={inst.audio.sustain} disabled={!inst.ready} onClick={() => inst.setSustain(!inst.audio.sustain)}>Sustain</button>}</div>
          <div className="practice-answer-actions">
            {step ? stepStatus === 'correct' ? <button className="practice-button is-primary" onClick={nextStep}>{current === expected.length - 1 ? 'Finish' : 'Next item →'}</button>
              : <><button className="practice-button" onClick={reveal}>Reveal</button><button className="practice-button is-primary" onClick={checkStep}>Check</button></>
              : <><button className="practice-button practice-reveal" onClick={reveal}>Reveal</button><button className="practice-button" disabled={current === 0} onClick={() => { setCurrent(current - 1); setMessage('') }} aria-label="Previous group">←</button>
                <button className="practice-button" onClick={nextGroup} aria-label="Next group">Next →</button><button className="practice-button is-primary" onClick={submit}>Submit</button></>}
          </div>
        </footer>
      </>}
      <div className={`practice-status${stepStatus === 'correct' ? ' is-correct' : ''}`} role="status">{audioError || message}
        {undo && !result && <button className="practice-undo" onClick={() => { setGroups(undo.groups); setCurrent(undo.current); setUndo(null); setMessage('Deletion undone.') }}>Undo</button>}</div>
    </>}
  </div>
}
