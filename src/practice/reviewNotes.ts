import type { MusicDocument } from '../music/model'
import { formatPitch } from '../music/pitch'
import { buildTimeline } from '../music/timeline'
import type { AlignedGroup } from './answers'

export interface ReviewNote {
  id: string
  pitch: number
  label: string
  start: number
  end: number
  kind: 'correct' | 'missing' | 'extra' | 'solution'
  sourceIndex?: number
  answerIndex?: number
}

/** Answers have no recorded timing. Red bars illustrate their aligned group only. */
export function buildReviewNotes(document: MusicDocument, rows: AlignedGroup[], revealed: boolean) {
  const timeline = buildTimeline(document)
  const groups = document.exercise!.answerGroups
  const noteMap = new Map(timeline.notes.map(note => [note.id, note]))
  const bounds = groups.map(group => ({
    start: Math.min(...group.noteIds.map(id => noteMap.get(id)!.startSeconds)),
    end: Math.max(...group.noteIds.map(id => noteMap.get(id)!.releaseSeconds)),
  }))
  const bySource = new Map(rows.map(row => [row.sourceIndex, row]))
  const membership = new Map(groups.flatMap((group, index) => group.noteIds.map(id => [id, index] as const)))
  const notes: ReviewNote[] = timeline.notes.map(note => {
    const sourceIndex = membership.get(note.id)
    const row = sourceIndex === undefined ? undefined : bySource.get(sourceIndex)
    return {
      id: note.id, pitch: note.noteNumber, label: note.spelling,
      start: note.startSeconds, end: note.releaseSeconds, sourceIndex,
      kind: revealed || sourceIndex === undefined ? 'solution' : row?.correct.includes(note.noteNumber) ? 'correct' : 'missing',
    }
  })
  if (!revealed) rows.forEach((row, index) => {
    const group = row.sourceIndex === undefined ? undefined : bounds[row.sourceIndex]
    const next = rows.slice(index + 1).find(candidate => candidate.sourceIndex !== undefined)
    const boundary = next ? bounds[next.sourceIndex!].start : timeline.durationSeconds
    // Unmatched groups sit just before the next source group (or at the end).
    const start = group?.start ?? Math.max(0, boundary - 0.18)
    const end = group?.end ?? Math.min(timeline.durationSeconds, start + 0.18)
    row.extra.forEach(pitch => notes.push({
      id: `answer-${index}-${pitch}`, pitch, label: formatPitch(pitch), start, end,
      kind: 'extra', sourceIndex: row.sourceIndex, answerIndex: row.answerIndex,
    }))
  })
  return { notes, bounds, duration: timeline.durationSeconds }
}
