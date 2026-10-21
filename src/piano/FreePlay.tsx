import { formatPitch } from '../music/pitch'
import { PianoKeyboard } from './PianoKeyboard'
import { useFreePlayInstrument } from './useFreePlayInstrument'
import './piano.css'

export default function FreePlay() {
  const { octave, setOctave, volume, setVolume, labels, setLabels, audio, mobile, rotate, low, high, ready, stop, press, release, tap, enable, setSustain } = useFreePlayInstrument()

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
          <button type="button" className="button primary" disabled={audio.status === 'loading'} onClick={enable}>{audio.status === 'loading' ? 'Loading piano…' : audio.status === 'error' ? 'Retry piano' : audio.status === 'suspended' ? 'Resume piano' : 'Enable piano'}<span aria-hidden="true">{audio.status === 'loading' ? '…' : '♪'}</span></button>
          <p className="quiet" role={audio.status === 'error' ? 'alert' : undefined}>{audio.status === 'error' ? audio.error : audio.status === 'loading' ? `${audio.loaded} of ${audio.total} piano samples ready` : 'Tap once to enable sound. Then make it your own.'}</p>
        </div>}
      </div>
      <div className="piano-toolbar" aria-label="Piano controls">
        <label className="volume-control">Volume <input aria-label="Volume" type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={event => setVolume(Number(event.target.value) / 100)} /><output>{Math.round(volume * 100)}%</output></label>
        <div className="piano-toggles">
          <button type="button" className="piano-control" aria-pressed={audio.sustain} disabled={!ready} onClick={() => setSustain(!audio.sustain)}><span className="pedal-mark" aria-hidden="true" />Sustain<span className="control-state">{audio.sustain ? 'On' : 'Off'}</span></button>
          <button type="button" className="piano-control" aria-pressed={labels} onClick={() => setLabels(value => !value)}>Note names<span className="control-state">{labels ? 'All' : 'C only'}</span></button>
          <button type="button" className="piano-control stop-sound" disabled={!ready} onClick={stop}>Stop sound <span aria-hidden="true">□</span></button>
        </div>
      </div>
      <div className={`keyboard-frame ${mobile ? 'keyboard-mobile' : 'keyboard-desktop'}`}>
        {mobile && <button className="octave-arrow" type="button" aria-label="Previous octave" disabled={octave === 0} onClick={() => setOctave(value => Math.max(0, value - 1))}><span className="chevron chevron-left" /></button>}
        <PianoKeyboard low={low} high={high} disabled={!ready || rotate} showLabels={labels} pressed={audio.pressed} sustained={audio.sustained} onPress={press} onRelease={release}
          onTap={tap} />
        {mobile && <button className="octave-arrow" type="button" aria-label="Next octave" disabled={octave === 7} onClick={() => setOctave(value => Math.min(7, value + 1))}><span className="chevron" /></button>}
      </div>
      <div className="keyboard-caption"><span>{formatPitch(low)} — {formatPitch(high)}{mobile ? '' : ' · 88 keys'}</span><span>{mobile ? 'Use the arrows to explore octaves' : 'Keyboard: A W S E D F T G Y H U J K O L P ; · Esc stops sound'}</span><a className="mobile-credit" href={`${import.meta.env.BASE_URL}audio/piano/CREDITS.md`} target="_blank" rel="noreferrer">Piano credits</a></div>
      <div className="piano-credit">Piano samples by Alexander Holm · <a href={`${import.meta.env.BASE_URL}audio/piano/CREDITS.md`} target="_blank" rel="noreferrer">Credits & license</a></div>
    </div>
  </section>
}
