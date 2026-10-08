import type { AnalyticEvent } from "./analytics"

/** Counts only. n sits beside every percent. No conclusion is drawn. */

export type Rate = { n: number; percent: number }

export type Counted = { key: string; n: number; percent: number }

export type StepTime = { step: string; n: number; mean: number | null; median: number | null }

function rate(part: number, whole: number): Rate {
  if (whole <= 0) return { n: part, percent: 0 }
  return { n: part, percent: Math.round((part / whole) * 1000) / 10 }
}

function counts(events: readonly AnalyticEvent[], keyOf: (event: AnalyticEvent) => string | null): Counted[] {
  const tally = new Map<string, number>()
  let whole = 0
  for (const event of events) {
    const key = keyOf(event)
    if (!key) continue
    whole += 1
    tally.set(key, (tally.get(key) ?? 0) + 1)
  }
  return [...tally.entries()]
    .map(([key, n]) => ({ key, ...rate(n, whole), n }))
    .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key))
}

export function cardFrequency(events: readonly AnalyticEvent[]): Counted[] {
  return counts(events, (event) => event.card ?? (event.move === "unresolved" ? "unresolved" : null))
}

export function disambiguationFrequency(events: readonly AnalyticEvent[]): Counted[] {
  return counts(events, (event) => event.pair_shown)
}

export function answerDistribution(events: readonly AnalyticEvent[]): Counted[] {
  return counts(events, (event) => (event.pair_shown && event.pair_answer ? `${event.pair_shown}:${event.pair_answer}` : null))
}

export function recognitionPerCard(events: readonly AnalyticEvent[]): Counted[] {
  return counts(events, (event) => (event.card && event.recognition ? `${event.card}:${event.recognition}` : null))
}

export function recognitionAroundDisambiguation(events: readonly AnalyticEvent[]): {
  before: Counted[]
  after: Counted[]
} {
  const withRecognition = events.filter((event) => event.recognition && event.card)
  return {
    before: counts(withRecognition, (event) => (event.changed_after_disambiguation ? null : `${event.card}:${event.recognition}`)),
    after: counts(withRecognition, (event) => (event.changed_after_disambiguation ? `${event.card}:${event.recognition}` : null)),
  }
}

export function changedAfterDisambiguationRate(events: readonly AnalyticEvent[]): Rate {
  const relevant = events.filter((event) => event.card || event.move === "unresolved" || event.pair_shown)
  const changed = relevant.filter((event) => event.changed_after_disambiguation).length
  return rate(changed, relevant.length)
}

export function dropoffByStep(events: readonly AnalyticEvent[]): Counted[] {
  return counts(events, (event) => event.dropoff_step)
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function stepTimes(events: readonly AnalyticEvent[]): StepTime[] {
  const groups = new Map<string, number[]>()
  for (const event of events) {
    if (event.step_number === null || event.step_time === null) continue
    const key = String(event.step_number)
    const list = groups.get(key) ?? []
    list.push(event.step_time)
    groups.set(key, list)
  }
  return [...groups.entries()]
    .map(([step, values]) => {
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length
      return { step, n: values.length, mean, median: median(values) }
    })
    .sort((a, b) => Number(a.step) - Number(b.step))
}

export function popularThemes(events: readonly AnalyticEvent[]): Counted[] {
  return counts(events, (event) => event.theme)
}

export function popularSources(events: readonly AnalyticEvent[]): Counted[] {
  return counts(events, (event) => event.source)
}
