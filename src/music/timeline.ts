import type { MusicDocument, MusicNote } from './model'
import { DEFAULT_STRENGTH } from './model'
import { parsePitch } from './pitch'
import { addBeats, compareBeats, createTempoClock, parseBeat } from './time'

/** Call with a validated document. Shared by future audio and visualization. */
export function buildTimeline(document: MusicDocument) {
  const toSeconds = createTempoClock(document.music.tempoChanges)
  const notes = document.music.parts.flatMap(part => part.notes.map(note => ({
    ...note, partId: part.id, instrumentId: part.instrumentId,
    hand: note.hand ?? part.hand,
    ...parsePitch(note.pitch),
    strength: note.strength ?? document.music.defaultStrength ?? DEFAULT_STRENGTH,
    startSeconds: toSeconds(note.at),
    releaseSeconds: toSeconds(addBeats(parseBeat(note.at), parseBeat(note.duration))),
  }))).sort((a, b) => compareBeats(parseBeat(a.at), parseBeat(b.at)) || a.id.localeCompare(b.id))
  return {
    notes,
    sustain: document.music.instruments.flatMap(instrument => (instrument.sustain ?? []).map(event => ({
      ...event, instrumentId: instrument.id, seconds: toSeconds(event.at),
    }))).sort((a, b) => compareBeats(parseBeat(a.at), parseBeat(b.at)) || a.instrumentId.localeCompare(b.instrumentId)),
    durationSeconds: toSeconds(document.music.length),
  }
}

/** Derived source pitches must never be displayed before an intentional reveal. */
export function solutionGroups(document: MusicDocument): { id: string; pitches: number[] }[] {
  const notes = new Map<string, MusicNote>(document.music.parts.flatMap(part => part.notes.map(note => [note.id, note] as const)))
  return (document.exercise?.answerGroups ?? []).map(group => ({
    id: group.id,
    pitches: [...new Set(group.noteIds.map(id => {
      const note = notes.get(id)
      if (!note) throw new Error(`Unknown solution note: ${id}`)
      return parsePitch(note.pitch).noteNumber
    }))].sort((a, b) => a - b),
  }))
}
