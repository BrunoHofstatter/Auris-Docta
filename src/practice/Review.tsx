import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { MusicDocument } from '../music/model'
import { pianoKeys } from '../piano/layout'
import type { AlignedGroup } from './answers'
import { buildReviewNotes } from './reviewNotes'
import type { ReviewNote } from './reviewNotes'
import { formatPitch } from '../music/pitch'

export function PitchChips({ pitches, kind }: { pitches: number[]; kind?: 'correct' | 'extra' | 'missing' }) {
  return <span className="practice-pitches">{pitches.map(pitch => <span key={pitch} className={`practice-pitch${kind ? ` is-${kind}` : ''}`}>
    {kind && <span aria-hidden="true">{kind === 'correct' ? '✓ ' : kind === 'extra' ? '× ' : '+ '}</span>}{formatPitch(pitch)}</span>)}</span>
}

const keys = pianoKeys(21, 108)
const keyMap = new Map(keys.map(key => [key.pitch, key]))
const colors = { correct: '#73be91', missing: '#e5c264', extra: '#e68787', solution: '#f2a541' }
const names = { correct: 'Correct', missing: 'Missing', extra: 'Your wrong answer', solution: 'Solution' }
const pitchLabel = (label: string) => label.replaceAll('#', '♯').replaceAll('b', '♭')
function description(note: ReviewNote) {
  return `${pitchLabel(note.label)} · ${names[note.kind]}${note.sourceIndex === undefined ? '' : ` · Item ${note.sourceIndex + 1}`}${note.kind === 'extra' ? ' · Illustrative timing' : ''}`
}

export default function Review({ document: music, rows, position, revealed, assisted, transport }: {
  document: MusicDocument; rows: AlignedGroup[]; position: number; revealed: boolean; assisted: boolean; transport: ReactNode
}) {
  const { notes, bounds } = useMemo(() => buildReviewNotes(music, rows, revealed), [music, rows, revealed])
  const player = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const fullscreenButton = useRef<HTMLButtonElement>(null)
  const nativeFullscreen = useRef(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [size, setSize] = useState({ width: 1000, height: 400 })
  const [selected, setSelected] = useState<ReviewNote | null>(null)
  const pattern = useId().replaceAll(':', '')
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    if (stage.current) observer.observe(stage.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const change = () => {
      if (document.fullscreenElement === player.current) nativeFullscreen.current = true
      else if (nativeFullscreen.current) {
        nativeFullscreen.current = false; setFullscreen(false); fullscreenButton.current?.focus()
      }
    }
    document.addEventListener('fullscreenchange', change)
    return () => document.removeEventListener('fullscreenchange', change)
  }, [])
  useEffect(() => {
    if (!fullscreen) return
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false); fullscreenButton.current?.focus()
        if (document.fullscreenElement === player.current) void document.exitFullscreen().catch(() => {})
      }
      if (event.key === 'Tab') {
        const controls = [...(player.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]') ?? [])]
        const first = controls[0], last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keyboard)
    return () => document.removeEventListener('keydown', keyboard)
  }, [fullscreen])
  const toggleFullscreen = async () => {
    if (fullscreen) {
      setFullscreen(false)
      if (document.fullscreenElement === player.current) await document.exitFullscreen().catch(() => {})
    } else {
      setFullscreen(true)
      // Keep the viewport-filling CSS view if element fullscreen is unavailable.
      try { await player.current?.requestFullscreen?.() } catch { /* In-page fullscreen remains available. */ }
    }
  }
  const width = Math.max(1, size.width), height = Math.max(1, size.height)
  const keyboardHeight = Math.min(130, Math.max(48, height * 0.23))
  const strike = Math.max(1, height - keyboardHeight)
  const pixelsPerSecond = strike / 4
  const y = (seconds: number) => strike - (seconds - position) * pixelsPerSecond
  const visible = notes.filter(note => note.end > position && y(note.start) >= 0)
  const active = new Map(notes.filter(note => note.start <= position && note.end > position && note.kind !== 'extra').map(note => [note.pitch, note.kind]))
  const exact = rows.filter(row => row.exact).length
  const title = revealed ? 'Solution' : exact === bounds.length && rows.length === bounds.length ? 'All correct' : 'Your result'
  return <div className="practice-review">
    <div className="practice-review-heading"><h1>{title}</h1>
      <span className="practice-muted">{!revealed && `${exact} / ${bounds.length} groups correct`}{assisted ? ' · Solution viewed' : ''}</span>
      {!revealed && <div className="practice-legend" aria-label="Correction colors"><span className="is-correct">Green · Correct</span><span className="is-missing">Yellow · Missing</span><span className="is-extra">▨ × Your answer</span></div>}
    </div>
    <div ref={player} className={`practice-review-player${fullscreen ? ' is-fullscreen' : ''}`} role="region" aria-label="Synthesia correction player">
      <div ref={stage} className="practice-roll" role="group" aria-label="Falling notes and full 88-key piano">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-label="Notes fall to the piano in time with the solution">
          <defs>
            <clipPath id={`${pattern}-fall`}><rect width={width} height={strike} /></clipPath>
            <pattern id={`${pattern}-wrong`} width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-2 2L2-2M0 7L7 0M5 9L9 5" stroke="#6c2828" strokeWidth="1.5" /></pattern>
            <linearGradient id={`${pattern}-white`} x2="0" y2="1"><stop stopColor="#d9d3c6" /><stop offset=".15" stopColor="#f4f0e6" /><stop offset="1" stopColor="#e6e0d3" /></linearGradient>
            <linearGradient id={`${pattern}-black`} x2="0" y2="1"><stop stopColor="#333" /><stop offset="1" stopColor="#090909" /></linearGradient>
          </defs>
          <g aria-hidden="true">
            {keys.filter(key => !key.black).map(key => <rect key={key.pitch} x={key.left / 100 * width} width={key.width / 100 * width} height={strike} fill={key.pitch % 12 === 0 ? '#202020' : '#191919'} stroke="#2b2b2b" strokeWidth=".5" />)}
          </g>
          <g clipPath={`url(#${pattern}-fall)`}>
            {bounds.map((bound, index) => y(bound.start) >= 0 && y(bound.start) <= strike && <g key={index} aria-hidden="true">
              <line x2={width} y1={y(bound.start)} y2={y(bound.start)} stroke="#363636" strokeDasharray="2 7" />
              <text x="5" y={y(bound.start) - 4} fill="#a09a8f" fontSize="9">{index + 1}</text>
            </g>)}
            {visible.map(note => {
              const key = keyMap.get(note.pitch)!
              const x = key.left / 100 * width + .6, barWidth = Math.max(1, key.width / 100 * width - 1.2)
              const top = y(note.end), bottom = y(note.start), barHeight = Math.max(3, bottom - top)
              const labelBottom = Math.min(strike - 4, bottom - 4)
              const labelSpace = labelBottom - Math.max(0, top)
              const label = `${note.kind === 'extra' ? '× ' : ''}${pitchLabel(note.label)}`
              const fontSize = Math.min(11, Math.max(5, barWidth - 2))
              return <g key={note.id} className={`practice-falling-note is-${note.kind}`} role="button" tabIndex={0} aria-label={description(note)} data-pitch={note.pitch} data-start={note.start} data-end={note.end}
                onClick={() => setSelected(note)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(note) } }}>
                <title>{description(note)}</title>
                <rect x={x} y={top} width={barWidth} height={barHeight} rx="2" fill={colors[note.kind]} />
                {note.kind === 'extra' && <rect x={x} y={top} width={barWidth} height={barHeight} rx="2" fill={`url(#${pattern}-wrong)`} stroke="#ffc7c7" strokeWidth="1" />}
                {labelSpace > 8 && <text transform={`translate(${x + barWidth / 2},${labelBottom}) rotate(-90)`} fontSize={fontSize} textLength={labelSpace < label.length * fontSize * .65 ? labelSpace - 2 : undefined} lengthAdjust="spacingAndGlyphs" fill="#141414" fontWeight="600" textAnchor="start" dominantBaseline="central" pointerEvents="none">{label}</text>}
              </g>
            })}
          </g>
          <line x2={width} y1={strike} y2={strike} stroke="#c5bba8" strokeWidth="2" aria-hidden="true" />
          <g aria-label="Piano A0 to C8">
            {[...keys.filter(key => !key.black), ...keys.filter(key => key.black)].map(key => {
              const kind = active.get(key.pitch)
              const keyHeight = keyboardHeight * (key.black ? .63 : 1)
              return <g key={key.pitch} data-review-key={key.pitch} data-active={kind ?? ''} aria-label={`${formatPitch(key.pitch)}${kind ? ', sounding' : ''}`}>
                <rect x={key.left / 100 * width} y={strike + 1} width={key.width / 100 * width} height={Math.max(1, keyHeight - 2)} rx="1" fill={kind ? colors[kind] : `url(#${pattern}-${key.black ? 'black' : 'white'})`} stroke={key.black ? '#080808' : '#9d978c'} strokeWidth=".6" />
                {!key.black && (key.pitch % 12 === 0 || key.pitch === 21) && <text x={(key.left + key.width / 2) / 100 * width} y={height - 7} textAnchor="middle" fontSize={Math.min(9, key.width / 100 * width - 2)} fill="#716a5e" aria-hidden="true">{formatPitch(key.pitch)}</text>}
              </g>
            })}
          </g>
        </svg>
        {selected && <button className="practice-note-detail" onClick={() => setSelected(null)} aria-label={`Dismiss note details: ${description(selected)}`}><span role="status">{description(selected)}</span><span aria-hidden="true"> ×</span></button>}
      </div>
      <div className="practice-review-controls">{transport}<button ref={fullscreenButton} className="practice-button practice-fullscreen-button" onClick={() => { void toggleFullscreen() }} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} aria-pressed={fullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{fullscreen ? '↙' : '⛶'}</button></div>
    </div>
  </div>
}
