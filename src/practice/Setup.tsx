import { useState } from 'react'
import type { Settings } from './generator'
import { CATEGORIES, CHORDS, exerciseLength, TONICS, validateSettings } from './generator'

export function Segments<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void
}) {
  return <div className="studio-seg" role="group" aria-label={label}>{options.map(option =>
    <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>
}

export default function Setup({ settings, onChange, onStart, active, onReturn }: {
  settings: Settings; onChange: (settings: Settings) => void; onStart: () => void; active: boolean; onReturn: () => void
}) {
  const [configure, setConfigure] = useState(false)
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value })
  const errors = validateSettings(settings)
  const length = exerciseLength(settings)
  const finiteLength = Number.isFinite(length.items) && Number.isFinite(length.seconds)
  return <div className="practice-setup">
    <div className="practice-title"><div><span className="practice-kicker">Practice</span><h1>{configure ? 'Choose your chords' : 'Set up your listening'}</h1></div>
      {active && <button className="practice-button" onClick={onReturn}>Back to exercise</button>}</div>
    {configure ? <>
      <p className="practice-muted">Choose each quality independently. C is an example root.</p>
      {[3, 4].map(size => <fieldset key={size}><legend>{size === 3 ? 'Triads' : 'Seventh chords'}</legend>
        <div className="practice-chord-grid">{CHORDS.filter(chord => chord.intervals.length === size).map(chord =>
          <button type="button" key={chord.id} className="practice-chord" aria-pressed={settings.chords.includes(chord.id)}
            onClick={() => update('chords', settings.chords.includes(chord.id) ? settings.chords.filter(id => id !== chord.id) : [...settings.chords, chord.id])}>
            <strong>{chord.symbol}</strong><span>{chord.name}</span><i aria-hidden="true">{settings.chords.includes(chord.id) ? '✓' : '+'}</i>
          </button>)}</div></fieldset>)}
      <button className="practice-button is-primary" onClick={() => setConfigure(false)}>Done · {settings.chords.length} selected</button>
    </> : <>
      <div className="practice-setup-grid">
        <section className="practice-settings-section" aria-labelledby="content-label">
          <h2 id="content-label">01 <span>Content</span></h2>
          <fieldset><legend>Exercise categories</legend><div className="practice-choices">{CATEGORIES.map(category =>
            <button type="button" className="practice-button" key={category.id} aria-pressed={settings.categories.includes(category.id)}
              onClick={() => update('categories', settings.categories.includes(category.id) ? settings.categories.filter(id => id !== category.id) : [...settings.categories, category.id])}>{category.label}</button>)}</div>
            {settings.categories.includes('chords') && <div className="practice-chord-summary"><span>{settings.chords.map(id => CHORDS.find(c => c.id === id)!.symbol).join(' · ') || 'No qualities selected'}</span>
              <button type="button" className="practice-button" onClick={() => setConfigure(true)}>Configure</button></div>}
          </fieldset>
          <fieldset><legend>Octaves</legend><div className="practice-octaves">{Array.from({ length: 9 }, (_, octave) =>
            <button type="button" className="practice-button" key={octave} aria-label={`Octave ${octave}`} aria-pressed={settings.octaves.includes(octave)}
              onClick={() => update('octaves', settings.octaves.includes(octave) ? settings.octaves.filter(o => o !== octave) : [...settings.octaves, octave].sort())}>{octave}</button>)}</div></fieldset>
          <div className="practice-field-pair"><label>Key<select aria-label="Key mode" value={settings.keyMode} onChange={event => update('keyMode', event.target.value as Settings['keyMode'])}>
            <option value="none">None</option><option value="major">Major</option><option value="minor">Natural minor</option></select></label>
            {settings.keyMode !== 'none' && <label>Tonic<select value={settings.tonic} onChange={event => update('tonic', event.target.value as Settings['tonic'])}>{TONICS.map(tonic => <option key={tonic}>{tonic}</option>)}</select></label>}</div>
        </section>
        <section className="practice-settings-section" aria-labelledby="playback-label">
          <h2 id="playback-label">02 <span>Playback</span></h2>
          <fieldset><legend>Within each item</legend><Segments label="Playback style" value={settings.playback} options={[{ value: 'simultaneous', label: 'Simultaneous' }, { value: 'successive', label: 'Successive' }]} onChange={value => update('playback', value)} /></fieldset>
          {settings.playback === 'successive' && <>
            <fieldset><legend>Successive speed</legend><Segments label="Successive speed" value={settings.spread} options={[{ value: 'slow', label: 'Slow' }, { value: 'medium', label: 'Medium' }, { value: 'fast', label: 'Fast' }]} onChange={value => update('spread', value)} /></fieldset>
            <fieldset><legend>Direction</legend><Segments label="Direction" value={settings.direction} options={[{ value: 'ascending', label: 'Ascending' }, { value: 'descending', label: 'Descending' }]} onChange={value => update('direction', value)} /></fieldset>
          </>}
          {settings.categories.includes('chords') && settings.chords.length > 0 && <fieldset><legend>Chord inversions</legend><Segments label="Chord inversions" value={settings.inversions} options={[{ value: 'root', label: 'Root position' }, { value: 'random', label: 'Random' }]} onChange={value => update('inversions', value)} /></fieldset>}
          <div className="practice-field-pair"><label>BPM<input type="number" min="20" max="300" step="5" value={Number.isFinite(settings.bpm) ? settings.bpm : ''} onChange={event => update('bpm', event.target.valueAsNumber)} /></label>
            <label>Instrument<select value="piano" disabled><option value="piano">Acoustic piano</option></select></label></div>
        </section>
        <section className="practice-settings-section" aria-labelledby="length-label">
          <h2 id="length-label">03 <span>Length &amp; mode</span></h2>
          <fieldset><legend>Set length by</legend><Segments label="Length unit" value={settings.lengthUnit} options={[{ value: 'items', label: 'Items' }, { value: 'seconds', label: 'Seconds' }]}
            onChange={value => onChange({ ...settings, lengthUnit: value, length: finiteLength ? value === 'items' ? length.items : Number(length.seconds.toFixed(3)) : 10 })} /></fieldset>
          <label>{settings.lengthUnit === 'items' ? 'Items' : 'Requested seconds'}<input type="number" min="1" max={settings.lengthUnit === 'items' ? 200 : 3600} step={settings.lengthUnit === 'items' ? 1 : 0.1}
            value={Number.isFinite(settings.length) ? settings.length : ''} onChange={event => update('length', event.target.valueAsNumber)} /></label>
          <p className="practice-length studio-num">{finiteLength ? `${length.items} items · ${Number(length.seconds.toFixed(3))} seconds` : 'Enter a length and BPM'}</p>
          <fieldset><legend>Practice mode</legend><Segments label="Practice mode" value={settings.mode} options={[{ value: 'full', label: 'Full sequence' }, { value: 'step', label: 'Step by step' }]} onChange={value => update('mode', value)} /></fieldset>
          {settings.mode === 'step' && <p className="practice-muted">Duration excludes time spent answering and retrying.</p>}
        </section>
      </div>
      <div className="practice-start-row"><div role={errors.length ? 'alert' : undefined} className="practice-validation">{errors.map(message => <p key={message}>{message}</p>)}</div>
        <button type="button" className="practice-button is-primary" disabled={!!errors.length} onClick={onStart}>{active ? 'Start new exercise' : 'Start exercise'} <span aria-hidden="true">→</span></button></div>
    </>}
  </div>
}
