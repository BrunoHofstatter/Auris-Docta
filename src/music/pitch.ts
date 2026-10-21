/** Equal temperament, A4 = 440 Hz. Numeric pitches are internal values, not MIDI input. */
export interface Pitch { noteNumber: number; spelling: string }
export const PIANO_RANGE = { min: 21, max: 108 } as const
const NATURALS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export function isPianoPitch(value: number): boolean {
  return Number.isInteger(value) && value >= PIANO_RANGE.min && value <= PIANO_RANGE.max
}

export function parsePitch(input: string): Pitch {
  const text = input.trim().replaceAll('♯', '#').replaceAll('♭', 'b')
  const match = /^([A-Ga-g])(#{1,2}|b{1,2})?(-1|[0-9])$/.exec(text)
  if (!match) throw new Error(`Invalid note "${input}". Use a pitch and octave, such as C4 or Bb3.`)
  const letter = match[1].toUpperCase()
  const accidental = match[2] ?? ''
  const octave = Number(match[3])
  const alteration = accidental.startsWith('#') ? accidental.length : -accidental.length
  const noteNumber = 12 * (octave + 1) + NATURALS[letter] + alteration
  if (noteNumber < 0 || noteNumber > 127) throw new Error('Pitch must sound within C−1–G9.')
  return { noteNumber, spelling: `${letter}${accidental}${octave}` }
}

export function formatPitch(noteNumber: number, accidentals: 'sharps' | 'flats' = 'sharps'): string {
  if (!Number.isInteger(noteNumber) || noteNumber < 0 || noteNumber > 127) throw new Error('Invalid sounding pitch.')
  return `${(accidentals === 'flats' ? FLATS : SHARPS)[noteNumber % 12]}${Math.floor(noteNumber / 12) - 1}`
}

export function pitchFrequency(noteNumber: number): number {
  formatPitch(noteNumber)
  return 440 * 2 ** ((noteNumber - 69) / 12)
}
