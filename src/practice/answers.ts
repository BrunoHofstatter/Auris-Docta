import { isPianoPitch, parsePitch } from '../music/pitch'

export function parseAnswer(text: string): number[] {
  const tokens = text.trim().split(/[\s,+;]+/).filter(Boolean)
  const pitches = tokens.map(token => parsePitch(token).noteNumber)
  if (!pitches.every(isPianoPitch)) throw new Error('Use notes within A0–C8, such as C4 E4 G4.')
  return [...new Set(pitches)].sort((a, b) => a - b)
}
export function compareGroup(expected: readonly number[], answer: readonly number[]) {
  const wanted = new Set(expected), actual = new Set(answer)
  const correct = [...wanted].filter(p => actual.has(p))
  const missing = [...wanted].filter(p => !actual.has(p))
  const extra = [...actual].filter(p => !wanted.has(p))
  return { expected: [...wanted], actual: [...actual], correct, missing, extra, exact: !missing.length && !extra.length }
}
export interface AlignedGroup extends ReturnType<typeof compareGroup> { sourceIndex?: number; answerIndex?: number }

/** Global sequence alignment prevents an omitted group shifting every later answer. */
export function alignAnswers(expected: readonly number[][], answers: readonly number[][]): AlignedGroup[] {
  const costs = Array.from({ length: expected.length + 1 }, () => new Float64Array(answers.length + 1))
  const moves = Array.from({ length: expected.length + 1 }, () => new Uint8Array(answers.length + 1))
  for (let i = 1; i <= expected.length; i++) { costs[i][0] = i; moves[i][0] = 1 }
  for (let j = 1; j <= answers.length; j++) { costs[0][j] = j; moves[0][j] = 2 }
  for (let i = 1; i <= expected.length; i++) for (let j = 1; j <= answers.length; j++) {
    const result = compareGroup(expected[i - 1], answers[j - 1])
    const substitution = 1 - result.correct.length / Math.max(result.expected.length, result.actual.length, 1)
    const options = [costs[i - 1][j - 1] + substitution, costs[i - 1][j] + 1, costs[i][j - 1] + 1]
    const move = options.indexOf(Math.min(...options))
    costs[i][j] = options[move]; moves[i][j] = move
  }
  const result: AlignedGroup[] = []
  let i = expected.length, j = answers.length
  while (i || j) {
    const move = moves[i][j]
    if (move === 0) { result.push({ sourceIndex: i - 1, answerIndex: j - 1, ...compareGroup(expected[--i], answers[--j]) }) }
    else if (move === 1) { result.push({ sourceIndex: i - 1, ...compareGroup(expected[--i], []) }) }
    else { result.push({ answerIndex: j - 1, ...compareGroup([], answers[--j]) }) }
  }
  return result.reverse()
}

/** A single unused trailing draft is not a submitted answer. Middle empties are errors. */
export function submittedGroups(groups: number[][]): number[][] {
  const result = groups.map(g => [...g])
  if (!result.at(-1)?.length) result.pop()
  if (!result.length) throw new Error('Enter an answer before checking.')
  const empty = result.findIndex(g => !g.length)
  if (empty !== -1) throw new Error(`Group ${empty + 1} is empty. Fill it or delete it.`)
  return result
}
