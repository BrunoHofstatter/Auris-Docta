export default function PianoStudy({ captions = true }: { captions?: boolean }) {
  return <div className="piano-study" aria-hidden="true">
    {captions && <div className="study-caption"><span>A space for listening</span><span>01 / PIANO</span></div>}
    <div className="roll-art">
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <span className="roll-line" key={i} />)}
      <i className="note-bar note-a" /><i className="note-bar note-b" />
      <i className="note-bar note-c" /><i className="note-bar note-d" />
      <i className="note-bar note-e" /><i className="note-bar note-f" />
    </div>
    <div className="keyboard-art">
      {Array.from({ length: 14 }, (_, i) => <span key={i} className={`white-key ${[2, 5, 9].includes(i) ? 'tinted' : ''}`}>
        {![2, 6].includes(i % 7) && i !== 13 && <i className="black-key" />}
      </span>)}
    </div>
    {captions && <div className="study-foot"><span>Listen closely.</span><span>There’s music in the details.</span></div>}
  </div>
}
