import { parsePitch } from '../music/pitch'

export const PIANO_SAMPLES = ['A0', ...Array.from({ length: 7 }, (_, i) => ['C', 'Ds', 'Fs', 'A'].map(n => `${n}${i + 1}`)).flat(), 'C8']
  .map(file => ({ file: `${file}.mp3`, pitch: parsePitch(file.replace('s', '#')).noteNumber }))

export function nearestSample(pitch: number): { file: string; pitch: number } {
  return PIANO_SAMPLES.reduce((best, sample) => Math.abs(sample.pitch - pitch) < Math.abs(best.pitch - pitch) ? sample : best)
}
