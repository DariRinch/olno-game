import {
  BOTH_MAIN_QUESTION,
  CARD_NAME,
  CHANGE_CHOICES,
  QUESTION,
  TEMPO_CHOICES,
  YES_NO,
  type CardId,
  type Choice,
  type PairId,
  isCardId,
} from "./cards"

/**
 * Closed facts only. Free text never enters this function.
 * A card is returned only when a closed answer makes it reliable.
 */

export type MoveFacts = {
  startedThenStopped: boolean | null
  substantialContact: boolean | null
  waitingForSomething: boolean | null
  /** Empty string means they were asked and did not name an object. */
  waitingObject: string | null
  continuedHabitual: boolean | null
  /** Null means the two-option question has not been asked. */
  namedOptionCount: number | null
  tempoOrPredictable: "tempo" | "predictable" | "neither" | null
  changed: "own-way" | "conditions" | "neither" | null
  mainOfBoth: CardId | null
}

export type Ask = {
  status: "ask"
  pair: PairId
  question: string
  choices: Choice[]
  field?: "waiting-object" | "two-options"
}

export type Resolution =
  | { status: "card"; card: CardId }
  | Ask
  | { status: "unresolved"; reason: "waiting-without-object" | "no-card" }

export function emptyFacts(): MoveFacts {
  return {
    startedThenStopped: null,
    substantialContact: null,
    waitingForSomething: null,
    waitingObject: null,
    continuedHabitual: null,
    namedOptionCount: null,
    tempoOrPredictable: null,
    changed: null,
    mainOfBoth: null,
  }
}

export function hasWaitingObject(facts: MoveFacts): boolean {
  return typeof facts.waitingObject === "string" && facts.waitingObject.trim() !== ""
}

/** Signals that a closed answer has already made reliable. Not a reading of prose. */
export function positiveSignals(facts: MoveFacts): CardId[] {
  const out: CardId[] = []
  if (facts.startedThenStopped === true) out.push("flight")
  if (facts.changed === "own-way") out.push("adaptation")
  if (facts.changed === "conditions") out.push("control")
  else if (facts.tempoOrPredictable === "predictable") out.push("control")
  if (facts.tempoOrPredictable === "tempo") out.push("acceleration")
  if (facts.continuedHabitual === true) out.push("holding")
  if (facts.namedOptionCount !== null && facts.namedOptionCount >= 2) out.push("doubt")
  if (facts.waitingForSomething === true && hasWaitingObject(facts) && facts.continuedHabitual === false) {
    out.push("waiting")
  }
  if (
    facts.substantialContact === false &&
    facts.waitingForSomething === false &&
    facts.continuedHabitual === false &&
    facts.namedOptionCount !== null &&
    facts.namedOptionCount < 2
  ) {
    out.push("avoidance")
  }
  return out
}

export function resolveMove(facts: MoveFacts): Resolution {
  const signals = positiveSignals(facts)
  if (facts.mainOfBoth && signals.includes(facts.mainOfBoth)) {
    return { status: "card", card: facts.mainOfBoth }
  }
  if (signals.length >= 2) {
    return {
      status: "ask",
      pair: "both-main",
      question: BOTH_MAIN_QUESTION,
      choices: signals.map((card) => ({ id: card, label: CARD_NAME[card] })),
    }
  }
  if (signals.length === 1) return { status: "card", card: signals[0] }

  if (facts.waitingForSomething === true && !hasWaitingObject(facts)) {
    if (facts.waitingObject === "") return { status: "unresolved", reason: "waiting-without-object" }
    return ask("waiting-object")
  }
  if (facts.waitingForSomething === true && hasWaitingObject(facts) && facts.continuedHabitual === null) {
    return ask("waiting-holding")
  }
  if (facts.substantialContact === null) return ask("contact-started")
  if (facts.substantialContact === true && facts.startedThenStopped === null) return ask("avoidance-flight")
  if (facts.substantialContact === false && facts.waitingForSomething === null) return ask("waiting-avoidance")
  if (facts.substantialContact === false && facts.waitingForSomething === false && facts.namedOptionCount === null) {
    return ask("avoidance-doubt")
  }
  if (
    facts.substantialContact === false &&
    facts.waitingForSomething === false &&
    facts.namedOptionCount !== null &&
    facts.namedOptionCount < 2 &&
    facts.continuedHabitual === null
  ) {
    return ask("waiting-holding")
  }
  if (facts.substantialContact === true && facts.startedThenStopped === false && facts.continuedHabitual === null) {
    return ask("waiting-holding")
  }
  if (
    facts.substantialContact === true &&
    facts.startedThenStopped === false &&
    facts.continuedHabitual === false &&
    facts.tempoOrPredictable === null
  ) {
    return ask("acceleration-control")
  }
  if (facts.tempoOrPredictable === "neither" && facts.changed === null) return ask("control-adaptation")
  return { status: "unresolved", reason: "no-card" }
}

function ask(pair: Exclude<PairId, "both-main">): Ask {
  if (pair === "waiting-object") {
    return { status: "ask", pair, question: QUESTION[pair], choices: [], field: "waiting-object" }
  }
  if (pair === "avoidance-doubt") {
    return {
      status: "ask",
      pair,
      question: QUESTION[pair],
      choices: [{ id: "not-two", label: "Двух вариантов нет" }],
      field: "two-options",
    }
  }
  if (pair === "acceleration-control") {
    return { status: "ask", pair, question: QUESTION[pair], choices: TEMPO_CHOICES }
  }
  if (pair === "control-adaptation") {
    return { status: "ask", pair, question: QUESTION[pair], choices: CHANGE_CHOICES }
  }
  return { status: "ask", pair, question: QUESTION[pair], choices: YES_NO }
}

export type ClosedAnswer = {
  pair: PairId
  answer: string
  /** Browser-only. Never copied into an analytic payload. */
  waitingObject?: string
  optionCount?: number
}

export function applyAnswer(facts: MoveFacts, answer: ClosedAnswer): MoveFacts {
  const next = { ...facts }
  switch (answer.pair) {
    case "contact-started":
      if (answer.answer === "yes") next.substantialContact = true
      if (answer.answer === "no") {
        next.substantialContact = false
        next.startedThenStopped = false
      }
      break
    case "avoidance-flight":
      if (answer.answer === "yes") {
        next.startedThenStopped = true
        next.substantialContact = true
      }
      if (answer.answer === "no") next.startedThenStopped = false
      break
    case "waiting-avoidance":
      if (answer.answer === "yes") next.waitingForSomething = true
      if (answer.answer === "no") next.waitingForSomething = false
      break
    case "waiting-object": {
      const named = (answer.waitingObject ?? answer.answer).trim()
      next.waitingForSomething = true
      next.waitingObject = named
      break
    }
    case "waiting-holding":
      if (answer.answer === "yes") next.continuedHabitual = true
      if (answer.answer === "no") next.continuedHabitual = false
      break
    case "avoidance-doubt":
      if (answer.answer === "not-two") next.namedOptionCount = answer.optionCount ?? 0
      if (answer.answer === "two-named") next.namedOptionCount = answer.optionCount ?? 2
      break
    case "acceleration-control":
      if (answer.answer === "tempo" || answer.answer === "predictable" || answer.answer === "neither") {
        next.tempoOrPredictable = answer.answer
      }
      break
    case "control-adaptation":
      if (answer.answer === "own-way" || answer.answer === "conditions" || answer.answer === "neither") {
        next.changed = answer.answer
      }
      break
    case "both-main":
      if (isCardId(answer.answer)) next.mainOfBoth = answer.answer
      break
    default:
      break
  }
  return next
}

export function applyAll(answers: readonly ClosedAnswer[]): MoveFacts {
  return answers.reduce(applyAnswer, emptyFacts())
}

export function changedAfterDisambiguation(log: readonly ClosedAnswer[]): boolean {
  const seen = new Map<string, string>()
  let revised = false
  for (const item of log) {
    const previous = seen.get(item.pair)
    if (previous !== undefined && previous !== item.answer) revised = true
    seen.set(item.pair, item.answer)
  }
  if (log.length < 2) return revised
  const first = resolveMove(applyAll(log.slice(0, 1)))
  const final = resolveMove(applyAll(log))
  if (first.status === "card" && final.status === "card" && first.card !== final.card) return true
  return revised
}

export function showRecognition(stepNumber: number, card: CardId | null): boolean {
  return card !== null && stepNumber % 2 === 1
}
