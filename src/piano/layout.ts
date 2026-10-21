import { PIANO_RANGE } from '../music/pitch'

export const INITIAL_OCTAVE = 4
export function isBlackKey(pitch: number) { return [1, 3, 6, 8, 10].includes(pitch % 12) }

/** C4–B5 plus the neighboring white notes B3 and C6. Ends clip at A0/C8. */
export function pianoRange(mobile: boolean, octave: number): [number, number] {
  return mobile
    ? [Math.max(PIANO_RANGE.min, 12 * (octave + 1) - 1), Math.min(PIANO_RANGE.max, 12 * (octave + 3))]
    : [PIANO_RANGE.min, PIANO_RANGE.max]
}

export function pianoKeys(low: number, high: number) {
  const pitches = Array.from({ length: high - low + 1 }, (_, i) => low + i)
  const whites = pitches.filter(p => !isBlackKey(p))
  let whiteIndex = 0
  return pitches.map(pitch => {
    const black = isBlackKey(pitch)
    const left = black ? (whiteIndex - 0.32) / whites.length * 100 : whiteIndex++ / whites.length * 100
    return { pitch, black, left, width: (black ? 0.64 : 1) / whites.length * 100 }
  })
}

// Physical key positions: an octave and a fifth beginning at C4.
export const COMPUTER_KEYS: Readonly<Record<string, number>> = {
  KeyA: 60, KeyW: 61, KeyS: 62, KeyE: 63, KeyD: 64, KeyF: 65, KeyT: 66,
  KeyG: 67, KeyY: 68, KeyH: 69, KeyU: 70, KeyJ: 71, KeyK: 72, KeyO: 73,
  KeyL: 74, KeyP: 75, Semicolon: 76,
}
