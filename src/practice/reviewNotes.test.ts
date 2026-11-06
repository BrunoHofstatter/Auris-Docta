import { describe, expect, it } from 'vitest'
import { buildTimeline, solutionGroups } from '../music/timeline'
import { alignAnswers } from './answers'
import { DEFAULT_SETTINGS, generateExercise } from './generator'
import { buildReviewNotes } from './reviewNotes'

function exercise() {
  return generateExercise({ ...structuredClone(DEFAULT_SETTINGS), categories: ['chords'], chords: ['major'], octaves: [4], length: 2, bpm: 60, playback: 'successive', spread: 'slow' }, () => 0)
}

describe('falling-note correction projection', () => {
  it('keeps the exact source attacks and releases for broken chords, without changing playback data', () => {
    const document = exercise(), original = structuredClone(document)
    const expected = solutionGroups(document).map(group => group.pitches)
    const answer = expected.map(group => [...group.slice(0, -1), 69])
    const { notes } = buildReviewNotes(document, alignAnswers(expected, answer), false)
    const timeline = buildTimeline(document)
    expect(notes.filter(note => note.kind !== 'extra').map(note => [note.id, note.start, note.end])).toEqual(timeline.notes.map(note => [note.id, note.startSeconds, note.releaseSeconds]))
    expect(notes.filter(note => note.kind === 'correct')).toHaveLength(4)
    expect(notes.filter(note => note.kind === 'missing')).toHaveLength(2)
    expect(notes.filter(note => note.kind === 'extra').map(note => [note.pitch, note.start, note.end])).toEqual([[69, 0, 1], [69, 1, 2]])
    expect(document).toEqual(original)
  })
  it('places unmatched answer groups within the source timeline, including at either end', () => {
    const document = exercise(), expected = solutionGroups(document).map(group => group.pitches)
    const { notes, duration } = buildReviewNotes(document, alignAnswers(expected, [[22], ...expected, [107]]), false)
    const extras = notes.filter(note => note.kind === 'extra')
    expect(extras).toHaveLength(2)
    expect(extras[0]).toMatchObject({ pitch: 22, start: 0, sourceIndex: undefined })
    expect(extras[1]).toMatchObject({ pitch: 107, end: duration, sourceIndex: undefined })
    expect(extras.every(note => note.start >= 0 && note.end > note.start && note.end <= duration)).toBe(true)
  })
  it('shows an ungraded solution after explicit reveal, without presenting entered answers as source notes', () => {
    const document = exercise(), expected = solutionGroups(document).map(group => group.pitches)
    const { notes } = buildReviewNotes(document, alignAnswers(expected, [[22]]), true)
    expect(notes).toHaveLength(buildTimeline(document).notes.length)
    expect(notes.every(note => note.kind === 'solution')).toBe(true)
  })
})
