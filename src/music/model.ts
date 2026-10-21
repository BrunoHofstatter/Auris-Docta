import { z } from 'zod'
import { parsePitch } from './pitch'
import { addBeats, compareBeats, formatBeat, parseBeat, ZERO } from './time'

export const DEFAULT_STRENGTH = 0.7
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024
const id = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/)
const strength = z.number().gt(0).max(1)
const beat = z.string().max(24).refine(value => { try { parseBeat(value); return true } catch { return false } }, 'Use a bounded nonnegative integer/fraction string.')
const positiveBeat = beat.refine(value => { try { return compareBeats(parseBeat(value), ZERO) > 0 } catch { return false } }, 'Duration must be positive.')
const pitch = z.string().max(8).refine(value => { try { parsePitch(value); return true } catch { return false } }, 'Invalid pitch or octave.')
const tonic = z.string().regex(/^[A-G](#{1,2}|b{1,2})?$/)
const hand = z.enum(['left', 'right'])

const noteSchema = z.object({
  id, pitch, at: beat, duration: positiveBeat, strength: strength.optional(), hand: hand.optional(),
}).strict()
const instrumentSchema = z.object({
  id,
  sound: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),
  sustain: z.array(z.object({ at: beat, down: z.boolean() }).strict()).max(10_000).optional(),
}).strict()
const partSchema = z.object({
  id, name: z.string().trim().min(1).max(200), instrumentId: id, hand: hand.optional(),
  notes: z.array(noteSchema).max(10_000),
}).strict()
const shape = z.object({
  format: z.literal('auris-docta'),
  version: z.literal(1),
  title: z.string().trim().min(1).max(200),
  music: z.object({
    timeUnit: z.literal('quarterNote'),
    length: positiveBeat,
    defaultStrength: strength.optional(),
    tempoChanges: z.array(z.object({ at: beat, quarterNotesPerMinute: z.number().min(1).max(1000) }).strict()).min(1).max(1000),
    keyChanges: z.array(z.object({ at: beat, tonic, mode: z.enum(['major', 'minor']) }).strict()).max(1000).optional(),
    meterChanges: z.array(z.object({ at: beat, numerator: z.number().int().min(1).max(64), denominator: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(8), z.literal(16), z.literal(32), z.literal(64)]) }).strict()).max(1000).optional(),
    instruments: z.array(instrumentSchema).min(1).max(64),
    parts: z.array(partSchema).min(1).max(128),
  }).strict(),
  exercise: z.object({
    answerGroups: z.array(z.object({ id, noteIds: z.array(id).min(1).max(128) }).strict()).min(1).max(10_000),
  }).strict().optional(),
}).strict()

/** Source JSON and application code use the same structure and validation. */
export const musicDocumentSchema = shape.superRefine((doc, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message })
  // Refinements may fail without stopping superRefine; preserve their field errors.
  const times = [doc.music.length, ...doc.music.tempoChanges.map(c => c.at),
    ...(doc.music.keyChanges ?? []).map(c => c.at), ...(doc.music.meterChanges ?? []).map(c => c.at),
    ...doc.music.instruments.flatMap(i => (i.sustain ?? []).map(c => c.at)),
    ...doc.music.parts.flatMap(p => p.notes.flatMap(n => [n.at, n.duration]))]
  try { times.forEach(parseBeat) } catch { return }
  const length = parseBeat(doc.music.length)
  const ordered = (changes: { at: string }[], path: (string | number)[], allowEnd = false) => {
    changes.forEach((change, i) => {
      const at = parseBeat(change.at)
      if (compareBeats(at, length) > 0 || (!allowEnd && compareBeats(at, length) === 0)) issue([...path, i, 'at'], 'Change must lie within the music timeline.')
      if (i && compareBeats(at, parseBeat(changes[i - 1].at)) <= 0) issue([...path, i, 'at'], 'Change positions must strictly increase; equivalent fractions are duplicates.')
    })
  }
  ordered(doc.music.tempoChanges, ['music', 'tempoChanges'])
  if (doc.music.tempoChanges.length && compareBeats(parseBeat(doc.music.tempoChanges[0].at), ZERO) !== 0) issue(['music', 'tempoChanges', 0, 'at'], 'Initial tempo must start at zero.')
  ordered(doc.music.keyChanges ?? [], ['music', 'keyChanges'])
  ordered(doc.music.meterChanges ?? [], ['music', 'meterChanges'])
  const instrumentIds = new Set<string>()
  doc.music.instruments.forEach((instrument, i) => {
    if (instrumentIds.has(instrument.id)) issue(['music', 'instruments', i, 'id'], 'Duplicate instrument ID.')
    instrumentIds.add(instrument.id)
    ordered(instrument.sustain ?? [], ['music', 'instruments', i, 'sustain'], true)
  })
  const partIds = new Set<string>()
  const notes = new Set<string>()
  doc.music.parts.forEach((part, i) => {
    const path = ['music', 'parts', i]
    if (partIds.has(part.id)) issue([...path, 'id'], 'Duplicate part ID.')
    partIds.add(part.id)
    if (!instrumentIds.has(part.instrumentId)) issue([...path, 'instrumentId'], 'Unknown instrument ID.')
    const attacks = new Set<string>()
    part.notes.forEach((note, j) => {
      if (notes.has(note.id)) issue([...path, 'notes', j, 'id'], 'Note IDs must be unique across all parts.')
      notes.add(note.id)
      try {
        const attack = `${formatBeat(parseBeat(note.at))}:${parsePitch(note.pitch).noteNumber}`
        if (attacks.has(attack)) issue([...path, 'notes', j], 'Duplicate sounding pitch at the same position within one part.')
        attacks.add(attack)
      } catch { /* Invalid pitch already has a field-level error. */ }
      if (compareBeats(addBeats(parseBeat(note.at), parseBeat(note.duration)), length) > 0) issue([...path, 'notes', j], 'Note release extends beyond the music length.')
    })
  })
  if (notes.size === 0) issue(['music', 'parts'], 'Music must contain at least one note.')
  if (doc.music.parts.reduce((sum, part) => sum + part.notes.length, 0) > 10_000) issue(['music', 'parts'], 'A document may contain at most 10,000 notes.')
  const groups = new Set<string>()
  const targets = new Set<string>()
  doc.exercise?.answerGroups.forEach((group, i) => {
    const path = ['exercise', 'answerGroups', i]
    if (groups.has(group.id)) issue([...path, 'id'], 'Duplicate answer-group ID.')
    groups.add(group.id)
    group.noteIds.forEach((noteId, j) => {
      if (!notes.has(noteId)) issue([...path, 'noteIds', j], 'Unknown note ID.')
      if (targets.has(noteId)) issue([...path, 'noteIds', j], 'A note may belong to only one answer group.')
      targets.add(noteId)
    })
  })
})

export type MusicDocument = z.infer<typeof musicDocumentSchema>
export type MusicNote = z.infer<typeof noteSchema>
export type MusicPart = z.infer<typeof partSchema>
export interface ValidationIssue { path: string; message: string }
export type DocumentResult = { success: true; document: MusicDocument } | { success: false; issues: ValidationIssue[] }

export function validateMusicDocument(input: unknown): DocumentResult {
  const result = musicDocumentSchema.safeParse(input)
  return result.success ? { success: true, document: result.data } : {
    success: false,
    issues: result.error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })),
  }
}

/** No UI importer yet. This bounded JSON entry point also validates fixtures. */
export function parseMusicDocument(text: string): DocumentResult {
  if (text.length > MAX_DOCUMENT_BYTES || new TextEncoder().encode(text).byteLength > MAX_DOCUMENT_BYTES) return { success: false, issues: [{ path: '', message: 'Document exceeds 4 MiB.' }] }
  let input: unknown
  try { input = JSON.parse(text) }
  catch { return { success: false, issues: [{ path: '', message: 'Document must be valid JSON.' }] } }
  return validateMusicDocument(input)
}
