import { z } from 'zod'
import { musicDocumentSchema } from '../music/model'
import type { MusicDocument, MusicNote } from '../music/model'
import { formatPitch, parsePitch, PIANO_RANGE } from '../music/pitch'
import { addBeats, formatBeat, parseBeat, subtractBeats } from '../music/time'

export const CATEGORIES = [
  { id: 'note', label: 'Single note' }, { id: 'octave', label: 'Octave' },
  { id: 'pair', label: 'Random pair' }, { id: 'chords', label: 'Chords' },
] as const
export const CHORDS = [
  { id: 'major', symbol: 'C', name: 'Major', intervals: [0, 4, 7] },
  { id: 'minor', symbol: 'Cm', name: 'Minor', intervals: [0, 3, 7] },
  { id: 'diminished', symbol: 'Cdim', name: 'Diminished · 3 notes', intervals: [0, 3, 6] },
  { id: 'augmented', symbol: 'Caug', name: 'Augmented', intervals: [0, 4, 8] },
  { id: 'dominant7', symbol: 'C7', name: 'Major + minor seventh', intervals: [0, 4, 7, 10] },
  { id: 'major7', symbol: 'C7M', name: 'Major + major seventh', intervals: [0, 4, 7, 11] },
  { id: 'minor7', symbol: 'Cm7', name: 'Minor + minor seventh', intervals: [0, 3, 7, 10] },
  { id: 'minorMajor7', symbol: 'Cm7M', name: 'Minor + major seventh', intervals: [0, 3, 7, 11] },
  { id: 'halfDiminished7', symbol: 'Cm7(b5)', name: 'Half-diminished · 4 notes', intervals: [0, 3, 6, 10] },
  { id: 'diminished7', symbol: 'C°7', name: 'Diminished · 4 notes', intervals: [0, 3, 6, 9] },
] as const
export type ChordId = typeof CHORDS[number]['id']
export type Category = typeof CATEGORIES[number]['id']
export const TONICS = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const
export const MAX_ITEMS = 200
const unique = <T,>(values: T[]) => new Set(values).size === values.length
export const settingsSchema = z.object({
  categories: z.array(z.enum(['note', 'octave', 'pair', 'chords'])).max(4).refine(unique),
  chords: z.array(z.enum(CHORDS.map(c => c.id))).max(CHORDS.length).refine(unique),
  octaves: z.array(z.number().int().min(0).max(8)).max(9).refine(unique),
  tonic: z.enum(TONICS), keyMode: z.enum(['none', 'major', 'minor']),
  bpm: z.number().int().min(20).max(300).multipleOf(5),
  lengthUnit: z.enum(['items', 'seconds']), length: z.number().finite().positive().max(3600),
  playback: z.enum(['simultaneous', 'successive']), spread: z.enum(['slow', 'medium', 'fast']),
  direction: z.enum(['ascending', 'descending']), inversions: z.enum(['root', 'random']),
  mode: z.enum(['full', 'step']),
}).strict()
export type Settings = z.infer<typeof settingsSchema>
export const DEFAULT_SETTINGS: Settings = {
  categories: ['note'], chords: ['major', 'minor'], octaves: [4, 5], tonic: 'C', keyMode: 'none',
  bpm: 60, lengthUnit: 'items', length: 10, playback: 'simultaneous', spread: 'medium',
  direction: 'ascending', inversions: 'root', mode: 'full',
}
export function exerciseLength(settings: Settings) {
  const items = Math.max(1, Math.round(settings.lengthUnit === 'items' ? settings.length : settings.length * settings.bpm / 60))
  return { items, seconds: items * 60 / settings.bpm }
}
export function scalePitches(settings: Settings): Set<number> | undefined {
  if (settings.keyMode === 'none') return undefined
  const root = parsePitch(`${settings.tonic}4`).noteNumber % 12
  const intervals = settings.keyMode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10]
  return new Set(intervals.map(i => (i + root) % 12))
}
export function allowedPitches(settings: Settings) {
  return Array.from({ length: 88 }, (_, i) => i + PIANO_RANGE.min)
    .filter(p => settings.octaves.includes(Math.floor(p / 12) - 1))
}
export function chordCandidates(settings: Settings, id: ChordId): number[][] {
  const chord = CHORDS.find(c => c.id === id)!
  const allowed = new Set(allowedPitches(settings))
  const scale = scalePitches(settings)
  const result = new Map<string, number[]>()
  for (let root = PIANO_RANGE.min; root <= PIANO_RANGE.max; root++) {
    // Test the underlying triad, not the bass of an inversion. Only the seventh is exempt.
    if (scale && !chord.intervals.slice(0, 3).every(i => scale.has((root + i) % 12))) continue
    const count = settings.inversions === 'random' ? chord.intervals.length : 1
    for (let inversion = 0; inversion < count; inversion++) {
      const notes = chord.intervals.map((i, index) => root + i + (index < inversion ? 12 : 0)).sort((a, b) => a - b)
      if (notes.every(p => allowed.has(p))) result.set(notes.join(','), notes)
    }
  }
  return [...result.values()]
}
export interface CandidatePool { category: Category; qualities: { id: string; notes: number[][] }[] }
export function candidatePools(settings: Settings): CandidatePool[] {
  const scale = scalePitches(settings)
  const pitches = allowedPitches(settings).filter(p => !scale || scale.has(p % 12))
  const allowed = new Set(pitches)
  return settings.categories.map(category => ({ category, qualities: category === 'chords'
    ? settings.chords.map(id => ({ id, notes: chordCandidates(settings, id) }))
    : [{ id: category, notes: category === 'note' ? pitches.map(p => [p]) : category === 'octave'
      ? pitches.filter(p => allowed.has(p + 12)).map(p => [p, p + 12])
      : pitches.flatMap((p, i) => pitches.slice(i + 1).filter(q => q - p <= 12).map(q => [p, q])) }],
  }))
}
export function validateSettings(input: unknown): string[] {
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return ['Use valid settings: BPM 20–300 in steps of 5, a positive length, and valid selections.']
  const settings = parsed.data
  const errors: string[] = []
  if (!settings.categories.length) errors.push('Select at least one exercise category.')
  if (!settings.octaves.length) errors.push('Select at least one octave.')
  if (settings.categories.includes('chords') && !settings.chords.length) errors.push('Configure Chords and select at least one quality.')
  if (settings.lengthUnit === 'items' && !Number.isInteger(settings.length)) errors.push('Enter a whole number of items.')
  if (exerciseLength(settings).items > MAX_ITEMS) errors.push(`Choose at most ${MAX_ITEMS} items (or reduce seconds/BPM).`)
  if (!settings.octaves.length) return errors
  for (const pool of candidatePools(settings)) for (const quality of pool.qualities) {
    if (!quality.notes.length) {
      const name = pool.category === 'chords' ? CHORDS.find(c => c.id === quality.id)!.symbol : CATEGORIES.find(c => c.id === pool.category)!.label
      errors.push(`${name} cannot fit the selected octaves${settings.keyMode === 'none' ? '' : ' and key'}. Change the range, key, or selection.`)
    }
  }
  return errors
}
export function generateExercise(settings: Settings, random: () => number = Math.random): MusicDocument {
  const errors = validateSettings(settings)
  if (errors.length) throw new Error(errors.join(' '))
  const pools = candidatePools(settings)
  const pick = <T,>(values: T[]): T => values[Math.min(values.length - 1, Math.max(0, Math.floor(random() * values.length)))]
  const notes: MusicNote[] = []
  const groups: { id: string; noteIds: string[] }[] = []
  const { items } = exerciseLength(settings)
  const spread = { slow: [3, 4], medium: [1, 4], fast: [1, 32] }[settings.spread]
  for (let item = 0; item < items; item++) {
    const pitches = [...pick(pick(pick(pools).qualities).notes)]
    if (settings.direction === 'descending' && settings.playback === 'successive') pitches.reverse()
    const noteIds = pitches.map((pitch, index) => {
      const offset = settings.playback === 'successive' && pitches.length > 1
        ? parseBeat(`${index * spread[0]}/${spread[1] * (pitches.length - 1)}`) : parseBeat('0')
      const at = addBeats(parseBeat(`${item}`), offset)
      const id = `n-${item}-${index}`
      notes.push({ id, pitch: formatPitch(pitch, settings.tonic.includes('b') ? 'flats' : 'sharps'), at: formatBeat(at),
        duration: formatBeat(subtractBeats(parseBeat(`${item + 1}`), at)) })
      return id
    })
    groups.push({ id: `g-${item}`, noteIds })
  }
  return musicDocumentSchema.parse({ format: 'auris-docta', version: 1, title: 'Practice exercise', music: {
    timeUnit: 'quarterNote', length: `${items}`, tempoChanges: [{ at: '0', quarterNotesPerMinute: settings.bpm }],
    keyChanges: settings.keyMode === 'none' ? [] : [{ at: '0', tonic: settings.tonic, mode: settings.keyMode }],
    instruments: [{ id: 'piano', sound: 'acoustic-grand-piano' }],
    parts: [{ id: 'practice', name: 'Practice', instrumentId: 'piano', notes }],
  }, exercise: { answerGroups: groups } })
}

export function readSettings(): Settings {
  try {
    const parsed = settingsSchema.safeParse(JSON.parse(localStorage.getItem('auris-practice-setup') ?? 'null'))
    if (parsed.success) return parsed.data
  } catch { /* Setup remains usable without local storage. */ }
  return structuredClone(DEFAULT_SETTINGS)
}
