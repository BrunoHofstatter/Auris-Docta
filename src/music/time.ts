/** JSON uses integer/fraction strings; exact arithmetic ends at the audio boundary. */
export interface Rational { readonly numerator: bigint; readonly denominator: bigint }
export const ZERO: Rational = { numerator: 0n, denominator: 1n }

function rational(numerator: bigint, denominator: bigint): Rational {
  let a = numerator < 0n ? -numerator : numerator
  let b = denominator
  while (b) [a, b] = [b, a % b]
  return { numerator: numerator / a, denominator: denominator / a }
}

export function parseBeat(value: string): Rational {
  if (value.length > 24 || !/^(0|[1-9]\d*)(\/[1-9]\d*)?$/.test(value)) {
    throw new Error('Time must be a nonnegative integer or fraction string, such as "0" or "7/2".')
  }
  const [n, d = '1'] = value.split('/')
  const numerator = BigInt(n)
  const denominator = BigInt(d)
  if (numerator > 1_000_000_000_000n || denominator > 1_000_000n) throw new Error('Time value exceeds format limits.')
  const result = rational(numerator, denominator)
  if (compareBeats(result, { numerator: 1_000_000n, denominator: 1n }) > 0) throw new Error('Timeline exceeds one million quarter notes.')
  return result
}

export function compareBeats(a: Rational, b: Rational): number {
  const delta = a.numerator * b.denominator - b.numerator * a.denominator
  return delta < 0n ? -1 : delta > 0n ? 1 : 0
}

export function addBeats(a: Rational, b: Rational): Rational {
  return rational(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator)
}

export function subtractBeats(a: Rational, b: Rational): Rational {
  return rational(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator)
}

export function beatValue(value: Rational): number {
  return Number(value.numerator) / Number(value.denominator)
}

export function formatBeat(value: Rational): string {
  return value.denominator === 1n ? `${value.numerator}` : `${value.numerator}/${value.denominator}`
}

export interface TempoChange { at: string; quarterNotesPerMinute: number }

/** A validated, chronologically ordered tempo map is required. */
export function createTempoClock(changes: readonly TempoChange[]) {
  if (changes.length === 0 || compareBeats(parseBeat(changes[0].at), ZERO) !== 0) throw new Error('The tempo map must begin at zero.')
  let elapsed = 0
  const segments = changes.map((change, i) => {
    const at = parseBeat(change.at)
    if (!Number.isFinite(change.quarterNotesPerMinute) || change.quarterNotesPerMinute <= 0) throw new Error('Invalid tempo.')
    if (i > 0) {
      const previous = changes[i - 1]
      const previousBeat = parseBeat(previous.at)
      if (compareBeats(at, previousBeat) <= 0) throw new Error('Tempo positions must increase.')
      elapsed += beatValue(subtractBeats(at, previousBeat)) * 60 / previous.quarterNotesPerMinute
    }
    return { at, seconds: elapsed, tempo: change.quarterNotesPerMinute }
  })
  return (position: string | Rational): number => {
    const at = typeof position === 'string' ? parseBeat(position) : position
    if (compareBeats(at, ZERO) < 0) throw new Error('Position must be nonnegative.')
    let low = 0
    let high = segments.length - 1
    while (low < high) {
      const mid = Math.ceil((low + high) / 2)
      if (compareBeats(segments[mid].at, at) <= 0) low = mid
      else high = mid - 1
    }
    const segment = segments[low]
    return segment.seconds + beatValue(subtractBeats(at, segment.at)) * 60 / segment.tempo
  }
}
