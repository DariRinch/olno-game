import { CARD_IDS, PAIR_IDS, SPEC_VERSION, type CardId, type PairId } from "./cards"

/**
 * Anonymous counters only.
 * There is no analytics server in this project. Events are shaped and stored
 * in the browser. sendEvents posts them only when a URL is passed in, and the
 * page does not pass one.
 */

export const ALLOWED_EVENT_KEYS = [
  "session_id",
  "spec_version",
  "source",
  "theme",
  "contact",
  "move",
  "pair_shown",
  "pair_answer",
  "card",
  "recognition",
  "step_time",
  "step_number",
  "dropoff_step",
  "changed_after_disambiguation",
] as const

export type AllowedEventKey = (typeof ALLOWED_EVENT_KEYS)[number]

export const THEME_IDS = ["relations", "family", "work", "fatigue", "money", "choice", "other"] as const

export const STEP_IDS = [
  "home",
  "situation",
  "link",
  "act",
  "clarify",
  "card",
  "happened",
  "route",
  "fork",
  "compare",
  "result",
] as const

const PAIR_ANSWERS = new Set<string>([
  "yes",
  "no",
  "two-named",
  "not-two",
  "tempo",
  "predictable",
  "neither",
  "own-way",
  "conditions",
  ...CARD_IDS,
])

export type AnalyticEvent = {
  session_id: string | null
  spec_version: string | null
  source: "card" | "own" | null
  theme: (typeof THEME_IDS)[number] | null
  contact: "none" | "started" | "ended" | null
  move: CardId | "unresolved" | null
  pair_shown: PairId | null
  pair_answer: string | null
  card: CardId | null
  recognition: "yes" | "partial" | "no" | null
  step_time: number | null
  step_number: number | null
  dropoff_step: (typeof STEP_IDS)[number] | null
  changed_after_disambiguation: boolean
}

export const EVENTS_KEY = "olno.events"

export function emptyEvent(): AnalyticEvent {
  return {
    session_id: null,
    spec_version: null,
    source: null,
    theme: null,
    contact: null,
    move: null,
    pair_shown: null,
    pair_answer: null,
    card: null,
    recognition: null,
    step_time: null,
    step_number: null,
    dropoff_step: null,
    changed_after_disambiguation: false,
  }
}

function asSession(value: unknown): string | null {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && allowed.some((item) => item === value) ? (value as T) : null
}

export function toPayload(input: object): AnalyticEvent {
  const source = input as Record<string, unknown>
  const event = emptyEvent()
  event.session_id = asSession(source.session_id)
  event.spec_version = source.spec_version === SPEC_VERSION ? SPEC_VERSION : null
  event.source = asEnum(source.source, ["card", "own"] as const)
  event.theme = asEnum(source.theme, THEME_IDS)
  event.contact = asEnum(source.contact, ["none", "started", "ended"] as const)
  event.move = asEnum(source.move, [...CARD_IDS, "unresolved"] as const)
  event.pair_shown = asEnum(source.pair_shown, PAIR_IDS)
  event.pair_answer = typeof source.pair_answer === "string" && PAIR_ANSWERS.has(source.pair_answer) ? source.pair_answer : null
  event.card = asEnum(source.card, CARD_IDS)
  event.recognition = asEnum(source.recognition, ["yes", "partial", "no"] as const)
  event.step_time = typeof source.step_time === "number" && Number.isFinite(source.step_time) && source.step_time >= 0
    ? source.step_time
    : null
  event.step_number = typeof source.step_number === "number" && Number.isInteger(source.step_number) && source.step_number >= 1
    ? source.step_number
    : null
  event.dropoff_step = asEnum(source.dropoff_step, STEP_IDS)
  event.changed_after_disambiguation = source.changed_after_disambiguation === true
  return event
}

export type EventStore = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function readEvents(store: EventStore): AnalyticEvent[] {
  try {
    const raw = store.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => item && typeof item === "object").map((item) => toPayload(item))
  } catch {
    return []
  }
}

export function remember(input: object, store: EventStore): AnalyticEvent {
  const clean = toPayload(input)
  const next = [...readEvents(store), clean]
  store.setItem(EVENTS_KEY, JSON.stringify(next))
  return clean
}

type Poster = (url: string, init: { method: string; headers: { "content-type": string }; body: string }) => Promise<unknown>

export async function sendEvents(
  events: readonly object[],
  url: string | null | undefined,
  fetchImpl: Poster = fetch,
): Promise<{ sent: false } | { sent: true; count: number }> {
  if (!url) return { sent: false }
  const body = events.map((event) => toPayload(event))
  await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  return { sent: true, count: body.length }
}
