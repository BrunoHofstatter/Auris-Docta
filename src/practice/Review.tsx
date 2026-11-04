import { useMemo } from 'react'
import type { MusicDocument } from '../music/model'
import { buildTimeline } from '../music/timeline'
import { formatPitch } from '../music/pitch'
import type { AlignedGroup } from './answers'

export function PitchChips({ pitches, kind }: { pitches: number[]; kind?: 'correct' | 'extra' | 'missing' }) {
  return <span className="practice-pitches">{pitches.map(pitch => <span key={pitch} className={`practice-pitch${kind ? ` is-${kind}` : ''}`}>
    {kind && <span aria-hidden="true">{kind === 'correct' ? '✓ ' : kind === 'extra' ? '× ' : '+ '}</span>}{formatPitch(pitch)}</span>)}</span>
}

export default function Review({ document, rows, position, revealed, assisted, onSeek }: {
  document: MusicDocument; rows: AlignedGroup[]; position: number; revealed: boolean; assisted: boolean; onSeek: (seconds: number) => void
}) {
  const timeline = useMemo(() => buildTimeline(document), [document])
  const groups = document.exercise!.answerGroups
  const noteMap = new Map(timeline.notes.map(note => [note.id, note]))
  const starts = groups.map(group => Math.min(...group.noteIds.map(id => noteMap.get(id)!.startSeconds)))
  const rowBySource = new Map(rows.filter(row => row.sourceIndex !== undefined).map(row => [row.sourceIndex!, row]))
  const pitches = [...timeline.notes.map(note => note.noteNumber), ...rows.flatMap(row => row.extra)]
  const low = Math.max(21, Math.min(...pitches) - 2), high = Math.min(108, Math.max(...pitches) + 2)
  const rowHeight = 22, labelWidth = 54, height = (high - low + 1) * rowHeight
  const width = Math.max(800, groups.length * 100)
  const x = (seconds: number) => labelWidth + seconds / timeline.durationSeconds * (width - labelWidth - 12)
  const y = (pitch: number) => (high - pitch) * rowHeight
  const exact = rows.filter(row => row.exact).length
  return <div className="practice-review">
    <div className="practice-review-heading"><h1>{revealed ? 'Solution' : exact === groups.length && rows.length === groups.length ? 'All correct' : 'Your result'}</h1>
      <span className="practice-muted">{!revealed && `${exact} / ${groups.length} groups correct`}{assisted ? ' · Solution viewed' : ''}</span></div>
    {!revealed && <div className="practice-legend"><span className="is-correct">✓ Correct</span><span className="is-extra">× Extra / wrong</span><span className="is-missing">+ Missing</span></div>}
    <div className="practice-roll" tabIndex={0} role="region" aria-label="Solution piano roll, scroll to inspect pitches and time">
      <svg width={width} height={height} role="img" aria-label="Pitch and duration visualization of the revealed solution">
        {Array.from({ length: high - low + 1 }, (_, index) => {
          const pitch = high - index
          return <g key={pitch}><rect x="0" y={index * rowHeight} width={width} height={rowHeight} fill={[1, 3, 6, 8, 10].includes(pitch % 12) ? '#191919' : '#222'} />
            <text x="6" y={index * rowHeight + 15} fill="#a09a8f" fontSize="11">{formatPitch(pitch)}</text></g>
        })}
        {starts.map((at, index) => <g key={index}>
          <line x1={x(at)} x2={x(at)} y1="0" y2={height} stroke="#414141" strokeDasharray="3 4" />
          <text x={x(at) + 4} y="12" fill="#a09a8f" fontSize="10">{index + 1}</text>
        </g>)}
        {groups.flatMap((group, index) => group.noteIds.map(id => {
          const note = noteMap.get(id)!, row = rowBySource.get(index)
          const correct = row?.correct.includes(note.noteNumber)
          const fill = revealed ? '#f2a541' : correct ? '#73be91' : '#e5c264'
          return <g key={id}><rect x={x(note.startSeconds)} y={y(note.noteNumber) + 3} width={Math.max(3, x(note.releaseSeconds) - x(note.startSeconds) - 2)} height={rowHeight - 6} rx="3" fill={fill} />
            <text x={x(note.startSeconds) + 4} y={y(note.noteNumber) + 15} fontSize="10" fill="#141414">{formatPitch(note.noteNumber)}</text></g>
        }))}
        {!revealed && rows.flatMap((row, index) => row.extra.map(pitch => {
          const at = row.sourceIndex !== undefined ? starts[row.sourceIndex] : (starts[rows.slice(index + 1).find(next => next.sourceIndex !== undefined)?.sourceIndex ?? groups.length] ?? timeline.durationSeconds) - 0.1
          return <rect key={`${index}-${pitch}`} x={x(Math.max(0, at))} y={y(pitch) + 3} width={Math.max(12, (width - labelWidth) / groups.length * 0.4)} height={rowHeight - 6} rx="3" fill="#e68787" />
        }))}
        <line x1={x(position)} x2={x(position)} y1="0" y2={height} stroke="#ece7dc" strokeWidth="2" />
      </svg>
    </div>
    <div className="practice-corrections" aria-label="Group correction details">{rows.map((row, index) => <div className="practice-correction" key={index}>
      <button className="practice-button" disabled={row.sourceIndex === undefined} onClick={() => onSeek(starts[row.sourceIndex!])}>
        {row.sourceIndex === undefined ? `Extra answer ${row.answerIndex! + 1}` : `Item ${row.sourceIndex + 1}`}</button>
      {revealed ? <PitchChips pitches={row.expected} /> : <div>
        <PitchChips pitches={row.correct} kind="correct" /><PitchChips pitches={row.extra} kind="extra" /><PitchChips pitches={row.missing} kind="missing" />
        {row.answerIndex === undefined && <span className="practice-muted"> Missing group</span>}
      </div>}
    </div>)}</div>
  </div>
}
