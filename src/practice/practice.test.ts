import { describe, expect, it } from 'vitest'
import { musicDocumentSchema } from '../music/model'
import { buildTimeline, solutionGroups } from '../music/timeline'
import { parsePitch } from '../music/pitch'
import { alignAnswers, compareGroup, parseAnswer, submittedGroups } from './answers'
import { allowedPitches, candidatePools, CHORDS, chordCandidates, DEFAULT_SETTINGS, exerciseLength, generateExercise, validateSettings } from './generator'
import type { Settings } from './generator'

function settings(changes: Partial<Settings> = {}): Settings { return { ...structuredClone(DEFAULT_SETTINGS), ...changes } }
function seeded(seed = 7) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 } }
const pitches = (values: string[]) => values.map(value => parsePitch(value).noteNumber)

describe('generator constraints', () => {
  it('has ten independently selectable qualities and safe initial selections', () => {
    expect(CHORDS).toHaveLength(10)
    expect(DEFAULT_SETTINGS.chords).toEqual(['major', 'minor'])
    expect(validateSettings(DEFAULT_SETTINGS)).toEqual([])
  })
  it('clips partial outer octaves to A0–C8 and respects nonadjacent selections', () => {
    expect(allowedPitches(settings({ octaves: [0, 8] }))).toEqual([21, 22, 23, 108])
    const doc = generateExercise(settings({ octaves: [1, 5], length: 100 }), seeded())
    expect(buildTimeline(doc).notes.every(note => [1, 5].includes(Math.floor(note.noteNumber / 12) - 1))).toBe(true)
  })
  it('keeps natural-minor single notes inside their scale', () => {
    const doc = generateExercise(settings({ tonic: 'A', keyMode: 'minor', length: 200 }), seeded())
    expect(buildTimeline(doc).notes.every(note => [0, 2, 4, 5, 7, 9, 11].includes(note.noteNumber % 12))).toBe(true)
  })
  it('permits altered sevenths but requires the entire underlying triad in key', () => {
    const s = settings({ categories: ['chords'], keyMode: 'major', tonic: 'C' })
    expect(chordCandidates(s, 'dominant7')).toContainEqual(pitches(['C4', 'E4', 'G4', 'Bb4']))
    expect(chordCandidates(s, 'dominant7')).not.toContainEqual(pitches(['D4', 'F#4', 'A4', 'C5']))
    expect(chordCandidates(s, 'minorMajor7')).toContainEqual(pitches(['D4', 'F4', 'A4', 'C#5']))
    expect(chordCandidates(s, 'augmented')).toEqual([])
    expect(chordCandidates({ ...s, inversions: 'random' }, 'dominant7')).toContainEqual(pitches(['E4', 'G4', 'Bb4', 'C5']))
  })
  it('never silently drops an impossible selected quality or expands the range', () => {
    const s = settings({ categories: ['note', 'chords'], chords: ['major', 'augmented'], keyMode: 'major' })
    expect(validateSettings(s).some(error => error.includes('Caug'))).toBe(true)
    expect(() => generateExercise(s)).toThrow('Caug')
    expect(validateSettings(settings({ categories: ['octave'], octaves: [4] })).length).toBeGreaterThan(0)
    expect(validateSettings(settings({ categories: ['chords'], chords: [] })).length).toBeGreaterThan(0)
    expect(validateSettings(settings({ categories: [], octaves: [] })).length).toBeGreaterThan(0)
  })
  it('builds only distinct random pairs no farther than one octave apart', () => {
    const pool = candidatePools(settings({ categories: ['pair'] }))[0].qualities[0].notes
    expect(pool.every(([a, b]) => a < b && b - a <= 12)).toBe(true)
  })
  it('restricts every inversion pitch to the selected octaves', () => {
    for (const chord of CHORDS) {
      const s = settings({ octaves: [4], inversions: 'random' })
      expect(chordCandidates(s, chord.id).every(group => group.every(p => p >= 60 && p <= 71))).toBe(true)
    }
  })
  it('chooses categories before qualities so adding qualities does not change category odds', () => {
    const s = settings({ categories: ['note', 'chords'], chords: CHORDS.map(c => c.id), length: 200 })
    const doc = generateExercise(s, seeded())
    const groups = solutionGroups(doc)
    const singles = groups.filter(g => g.pitches.length === 1).length
    expect(singles).toBeGreaterThan(70)
    expect(singles).toBeLessThan(130)
    // A controlled category draw chooses a note even with ten chord qualities.
    expect(solutionGroups(generateExercise({ ...s, length: 1 }, () => 0.49))[0].pitches).toHaveLength(1)
  })
})

describe('generated timing and canonical document', () => {
  it.each(['slow', 'medium', 'fast'] as const)('uses exact %s fractions and independent durations ending on the boundary', spread => {
    const s = settings({ categories: ['chords'], chords: ['major7'], length: 2, bpm: 120, playback: 'successive', spread })
    const doc = generateExercise(s, () => 0)
    expect(musicDocumentSchema.safeParse(doc).success).toBe(true)
    const timeline = buildTimeline(doc)
    const first = timeline.notes.slice(0, 4)
    expect(first.at(-1)!.startSeconds).toBeCloseTo({ slow: 0.375, medium: 0.125, fast: 0.015625 }[spread])
    expect(first.every(note => note.releaseSeconds === 0.5)).toBe(true)
    expect(timeline.notes.at(-1)!.releaseSeconds).toBe(1)
    expect(solutionGroups(doc)).toHaveLength(2)
  })
  it('reverses successive attack order without changing chord membership', () => {
    const s = settings({ categories: ['chords'], chords: ['major'], length: 1, playback: 'successive' })
    const ascending = generateExercise(s, () => 0)
    const descending = generateExercise({ ...s, direction: 'descending' }, () => 0)
    expect(buildTimeline(descending).notes.map(n => n.noteNumber)).toEqual(buildTimeline(ascending).notes.map(n => n.noteNumber).reverse())
    expect(solutionGroups(descending)).toEqual(solutionGroups(ascending))
  })
  it('rounds seconds to whole items, reports actual length, and rejects excessive lengths', () => {
    expect(exerciseLength(settings({ bpm: 100, lengthUnit: 'seconds', length: 7 }))).toEqual({ items: 12, seconds: 7.2 })
    expect(exerciseLength(settings({ lengthUnit: 'seconds', length: 0.01 }))).toEqual({ items: 1, seconds: 1 })
    expect(validateSettings(settings({ length: 201 }))).not.toEqual([])
    expect(validateSettings(settings({ length: NaN }))).not.toEqual([])
    expect(validateSettings(settings({ bpm: 101 }))).not.toEqual([])
  })
  it('preserves repeated attacks as separate source groups', () => {
    const doc = generateExercise(settings({ length: 2 }), () => 0)
    expect(solutionGroups(doc)[0].pitches).toEqual(solutionGroups(doc)[1].pitches)
    expect(doc.exercise!.answerGroups[0].noteIds).not.toEqual(doc.exercise!.answerGroups[1].noteIds)
  })
})

describe('manual answers and sequence alignment', () => {
  it('normalizes enharmonic notes, deduplicates, and keeps octave identity', () => {
    expect(parseAnswer('Db4, C#4 + E4 G4')).toEqual([61, 64, 67])
    expect(compareGroup([60, 64, 67], [67, 60, 64]).exact).toBe(true)
    expect(compareGroup([60], [72]).exact).toBe(false)
    expect(() => parseAnswer('C9')).toThrow('A0–C8')
    expect(() => parseAnswer('banana')).toThrow()
  })
  it('separates correct, wrong, and missing pitches in a partial chord', () => {
    expect(compareGroup([60, 64, 67], [60, 64, 69])).toMatchObject({ correct: [60, 64], extra: [69], missing: [67], exact: false })
  })
  it('aligns omissions and insertions without making later correct notes wrong', () => {
    expect(alignAnswers([[60], [62], [64]], [[60], [64]]).map(row => [row.sourceIndex, row.answerIndex])).toEqual([[0, 0], [1, undefined], [2, 1]])
    const rows = alignAnswers([[60], [64]], [[60], [62], [64]])
    expect(rows.map(row => [row.sourceIndex, row.answerIndex])).toEqual([[0, 0], [undefined, 1], [1, 2]])
    expect(rows.at(-1)!.exact).toBe(true)
  })
  it('keeps repeated groups distinct and handles an intentionally empty solution-view answer', () => {
    expect(alignAnswers([[60], [60]], [[60]])).toHaveLength(2)
    expect(alignAnswers([[60], [64]], []).every(row => row.answerIndex === undefined)).toBe(true)
  })
  it('ignores one trailing draft, rejects middle empty groups, and copies submitted data', () => {
    const source = [[60], []]
    const result = submittedGroups(source)
    source[0].push(64)
    expect(result).toEqual([[60]])
    expect(() => submittedGroups([[60], [], [64]])).toThrow('Group 2')
    expect(() => submittedGroups([[]])).toThrow('Enter an answer')
  })
})
