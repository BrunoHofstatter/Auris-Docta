import type { MusicDocument } from '../music/model'
import { buildTimeline } from '../music/timeline'
import { isPianoPitch } from '../music/pitch'

/** Resolve sustain before scheduling; every note keeps its independent identity. */
export function planPlayback(document: MusicDocument) {
  if (document.music.instruments.some(i => i.sound !== 'acoustic-grand-piano')) throw new Error('Only acoustic-grand-piano is installed.')
  const timeline = buildTimeline(document)
  if (timeline.notes.some(note => !isPianoPitch(note.noteNumber))) throw new Error('This piano supports A0–C8.')
  const notes = timeline.notes.map(note => {
    const events = timeline.sustain.filter(e => e.instrumentId === note.instrumentId)
    const state = events.filter(e => e.seconds <= note.releaseSeconds).at(-1)?.down ?? false
    const pedalUp = events.find(e => e.seconds > note.releaseSeconds && !e.down)?.seconds
    return { ...note, soundReleaseSeconds: state ? pedalUp ?? timeline.durationSeconds : note.releaseSeconds }
  })
  return { notes, durationSeconds: timeline.durationSeconds }
}
