import { describe, expect, it } from 'vitest'
import scale from '../../examples/c-major-scale.json'
import { DEFAULT_STRENGTH, parseMusicDocument, validateMusicDocument } from './model'
import type { MusicDocument } from './model'
import { formatPitch, isPianoPitch, parsePitch, pitchFrequency } from './pitch'
import { addBeats, compareBeats, createTempoClock, formatBeat, parseBeat } from './time'
import { buildTimeline, solutionGroups } from './timeline'

function example(): MusicDocument {
  const result = validateMusicDocument(structuredClone(scale))
  if (!result.success) throw new Error(JSON.stringify(result.issues))
  return result.document
}

describe('pitch identity', () => {
  it('normalizes enharmonics across octave boundaries and preserves spelling', () => {
    expect(parsePitch('Db4').noteNumber).toBe(parsePitch('C#4').noteNumber)
    expect(parsePitch('B#3')).toEqual({ noteNumber: 60, spelling: 'B#3' })
    expect(parsePitch('Cb4').noteNumber).toBe(59)
    expect(parsePitch(' f♯4 ').spelling).toBe('F#4')
    expect(parsePitch('Ebb4').noteNumber).toBe(62)
  })
  it('keeps instrument pitch support independent of piano keyboard limits', () => {
    expect(parsePitch('C-1').noteNumber).toBe(0)
    expect(parsePitch('G9').noteNumber).toBe(127)
    expect(isPianoPitch(0)).toBe(false)
    expect(isPianoPitch(21)).toBe(true)
    expect(isPianoPitch(108)).toBe(true)
    expect(formatPitch(61, 'flats')).toBe('Db4')
    expect(pitchFrequency(69)).toBe(440)
  })
  it.each(['H4', 'C', 'C4!', 'C#b4', 'C10', 'G#9', 'Cb-1'])('rejects malformed/out-of-range pitch %s', input => {
    expect(() => parsePitch(input)).toThrow()
  })
})

describe('exact musical time', () => {
  it('adds thirds exactly and normalizes equivalent fractions', () => {
    const third = parseBeat('1/3')
    expect(formatBeat(addBeats(addBeats(third, third), third))).toBe('1')
    expect(compareBeats(parseBeat('7/2'), parseBeat('14/4'))).toBe(0)
    expect(formatBeat(parseBeat('0/3'))).toBe('0')
  })
  it.each(['0.5', '-1', '1/0', '1e3', '01', '1 / 3', '1/1000001', '1000001', '99999999999999999999999999'])('rejects invalid time %s', value => {
    expect(() => parseBeat(value)).toThrow()
  })
  it('integrates step tempo changes at their exact positions', () => {
    const clock = createTempoClock([{ at: '0', quarterNotesPerMinute: 120 }, { at: '4', quarterNotesPerMinute: 60 }])
    expect(clock('0')).toBe(0)
    expect(clock('4')).toBe(2)
    expect(clock('6')).toBe(4)
    expect(clock('9/2')).toBe(2.5)
  })
  it('rejects missing and unordered initial tempo maps', () => {
    expect(() => createTempoClock([])).toThrow()
    expect(() => createTempoClock([{ at: '1', quarterNotesPerMinute: 120 }])).toThrow()
    expect(() => createTempoClock([{ at: '0', quarterNotesPerMinute: 0 }])).toThrow()
  })
})

describe('document and timeline', () => {
  it('accepts the documented example and derives its chord without a duplicate answer key', () => {
    const doc = example()
    expect(parseMusicDocument(JSON.stringify(doc)).success).toBe(true)
    const timeline = buildTimeline(doc)
    expect(timeline.notes).toHaveLength(11)
    expect(timeline.durationSeconds).toBe(6)
    expect(timeline.notes.find(n => n.id === 'n1')?.strength).toBe(0.7)
    expect(timeline.notes.find(n => n.id === 'n11')?.strength).toBe(0.9)
    expect(solutionGroups(doc).at(-1)?.pitches).toEqual([60, 64, 67])
  })
  it('uses the application strength default and respects a note hand override', () => {
    const doc = example()
    delete doc.music.defaultStrength
    doc.music.parts[0].notes[0].hand = 'left'
    const note = buildTimeline(doc).notes.find(n => n.id === 'n1')!
    expect(note.strength).toBe(DEFAULT_STRENGTH)
    expect(note.hand).toBe('left')
  })
  it('keeps a successive chord in one explicit answer group', () => {
    const doc = example()
    doc.music.parts[0].notes.find(n => n.id === 'n10')!.at = '17/2'
    doc.music.parts[0].notes.find(n => n.id === 'n10')!.duration = '7/2'
    doc.music.parts[0].notes.find(n => n.id === 'n11')!.at = '9'
    doc.music.parts[0].notes.find(n => n.id === 'n11')!.duration = '3'
    expect(validateMusicDocument(doc).success).toBe(true)
    expect(solutionGroups(doc)).toHaveLength(9)
    expect(solutionGroups(doc).at(-1)?.pitches).toEqual([60, 64, 67])
  })
  it('supports simultaneous instruments, independent lifetimes, shared sustain, and pitch doubling', () => {
    const doc = example()
    doc.music.instruments[0].sustain = [{ at: '0', down: true }, { at: '12', down: false }]
    doc.music.instruments.push({ id: 'flute-1', sound: 'flute' })
    doc.music.parts[1].notes.push({ id: 'bass', pitch: 'C3', at: '0', duration: '8' })
    doc.music.parts.push({ id: 'flute', name: 'Flute', instrumentId: 'flute-1', notes: [{ id: 'f1', pitch: 'B#3', at: '0', duration: '2' }] })
    doc.exercise!.answerGroups[0].noteIds.push('f1')
    expect(validateMusicDocument(doc).success).toBe(true)
    const timeline = buildTimeline(doc)
    expect(timeline.notes.filter(n => n.startSeconds === 0)).toHaveLength(3)
    expect(timeline.notes.find(n => n.id === 'bass')?.releaseSeconds).toBe(4)
    expect(timeline.sustain.at(-1)?.seconds).toBe(6)
    expect(solutionGroups(doc)[0].pitches).toEqual([60])
    expect(solutionGroups(doc).flatMap(g => g.pitches)).not.toContain(48)
  })
  it('converts note release across tempo changes rather than using just its starting tempo', () => {
    const doc = example()
    doc.music.tempoChanges.push({ at: '9', quarterNotesPerMinute: 60 })
    const chord = buildTimeline(doc).notes.find(n => n.id === 'n9')!
    expect(chord.startSeconds).toBe(4)
    expect(chord.releaseSeconds).toBe(7.5)
  })
  it('preserves repeated pitches as distinct notes and answer groups', () => {
    const doc = example()
    doc.music.parts[0].notes[1].pitch = 'C4'
    expect(solutionGroups(doc).slice(0, 2).map(g => g.pitches)).toEqual([[60], [60]])
    expect(buildTimeline(doc).notes.filter(n => n.pitch === 'C4').length).toBe(3)
  })
  it('allows music without a grading layer and has no accidental key restriction', () => {
    const doc = example()
    delete doc.exercise
    doc.music.parts[0].notes[0].pitch = 'C#4'
    expect(validateMusicDocument(doc).success).toBe(true)
    expect(solutionGroups(doc)).toEqual([])
  })
})

describe('invalid documents', () => {
  const cases: [string, (doc: MusicDocument) => void][] = [
    ['unknown instruments', d => { d.music.parts[0].instrumentId = 'missing' }],
    ['unknown solution notes', d => { d.exercise!.answerGroups[0].noteIds = ['missing'] }],
    ['duplicate note IDs across parts', d => { d.music.parts[1].notes.push({ ...d.music.parts[0].notes[0] }) }],
    ['duplicate same-part attacks', d => { d.music.parts[0].notes.push({ id: 'duplicate', pitch: 'B#3', at: '0/2', duration: '1' }) }],
    ['duplicate answer groups', d => { d.exercise!.answerGroups[1].id = 'g1' }],
    ['a note targeted twice', d => { d.exercise!.answerGroups[1].noteIds = ['n1'] }],
    ['equivalent tempo timestamps', d => { d.music.tempoChanges.push({ at: '0/2', quarterNotesPerMinute: 90 }) }],
    ['zero duration', d => { d.music.parts[0].notes[0].duration = '0' }],
    ['bad fraction', d => { d.music.parts[0].notes[0].duration = '1/0' }],
    ['zero strength', d => { d.music.parts[0].notes[0].strength = 0 }],
    ['non-finite strength', d => { d.music.defaultStrength = Infinity }],
    ['notes beyond the end', d => { d.music.parts[0].notes[0].duration = '13' }],
    ['tempo changes at the end', d => { d.music.tempoChanges.push({ at: '12', quarterNotesPerMinute: 90 }) }],
    ['missing tempo', d => { d.music.tempoChanges = [] }],
    ['unsupported versions', d => { Object.assign(d, { version: 2 }) }],
    ['unsupported expressive fields', d => { Object.assign(d.music.parts[0].notes[0], { pitchBend: 0.2 }) }],
  ]
  it.each(cases)('rejects %s with a location', (_, mutate) => {
    const doc = example()
    mutate(doc)
    const result = validateMusicDocument(doc)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.issues[0].path.length).toBeGreaterThan(0)
  })
  it.each([null, [], 42, 'music', {}, { music: null }])('handles malformed input without throwing: %j', input => {
    expect(validateMusicDocument(input).success).toBe(false)
  })
  it('rejects oversized and malformed JSON', () => {
    expect(parseMusicDocument('{')).toMatchObject({ success: false })
    expect(parseMusicDocument(' '.repeat(4 * 1024 * 1024 + 1))).toMatchObject({ success: false })
  })
})
