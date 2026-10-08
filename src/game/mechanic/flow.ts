import { CARD_NAME, SPEC_VERSION, UNRESOLVED_LABEL, type CardId, isCardId } from "./cards"
import {
  applyAll,
  applyAnswer,
  changedAfterDisambiguation,
  emptyFacts,
  resolveMove,
  showRecognition,
  type ClosedAnswer,
  type MoveFacts,
} from "./resolve"
import { tagTransition, type Continuation, type TransitionKind } from "./transition"

export { SPEC_VERSION }

export const SCREENS = [
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

export type ScreenId = (typeof SCREENS)[number]

export type Recognition = "yes" | "partial" | "no"

export type Move = {
  actText: string
  happenedText: string
  /** Named options stay on the move. They are not an analytic field. */
  optionTexts: string[]
  facts: MoveFacts
  answers: ClosedAnswer[]
  log: ClosedAnswer[]
  card: CardId | null
  recognition: Recognition | null
  continuation: Continuation | null
  transition: TransitionKind | null
  changedAfterDisambiguation: boolean
}

export type Run = {
  version: 3
  screen: ScreenId
  sessionId: string
  themeId: string | null
  situationSource: "card" | "own" | null
  situationText: string
  moves: Move[]
  editing: number
  forkIndex: number | null
  alternativeCard: CardId | null
  tryAction: string
}

export type StepError = "empty" | "same"

const TEXT_LIMIT = 280

export function blankMove(): Move {
  return {
    actText: "",
    happenedText: "",
    optionTexts: [],
    facts: emptyFacts(),
    answers: [],
    log: [],
    card: null,
    recognition: null,
    continuation: null,
    transition: null,
    changedAfterDisambiguation: false,
  }
}

export function createRun(sessionId = crypto.randomUUID()): Run {
  return {
    version: 3,
    screen: "home",
    sessionId,
    themeId: null,
    situationSource: null,
    situationText: "",
    moves: [],
    editing: 0,
    forkIndex: null,
    alternativeCard: null,
    tryAction: "",
  }
}

function clean(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, TEXT_LIMIT)
}

function patchMove(run: Run, index: number, move: Move): Run {
  const moves = run.moves.slice()
  moves[index] = refreshTransition(moves, index, move)
  return { ...run, moves }
}

function refreshTransition(moves: readonly Move[], index: number, move: Move): Move {
  if (index === 0) return { ...move, transition: null }
  const previous = moves[index - 1]?.card ?? null
  return { ...move, transition: tagTransition(previous, move.card, move.continuation) }
}

function editingMove(run: Run): Move | null {
  return run.moves[run.editing] ?? null
}

export function openSituation(run: Run): Run {
  if (run.screen !== "home") return run
  return { ...run, screen: "situation" }
}

export function submitSituation(
  run: Run,
  raw: string,
  source: "card" | "own",
  themeId: string | null,
): Run | StepError {
  if (run.screen !== "situation") return run
  const text = clean(raw)
  if (!text) return "empty"
  const moves = run.moves.length > 0 ? run.moves : [blankMove()]
  return {
    ...run,
    screen: "act",
    situationText: text,
    situationSource: source,
    themeId: source === "card" ? themeId : null,
    moves,
    editing: 0,
  }
}

export function submitAct(run: Run, raw: string): Run | StepError {
  if (run.screen !== "act") return run
  const text = clean(raw)
  if (!text) return "empty"
  const current = editingMove(run)
  if (!current) return run
  const move = { ...current, actText: text }
  const next = placeAfterFacts(patchMove(run, run.editing, move), run.editing)
  return next
}

function placeAfterFacts(run: Run, index: number): Run {
  const current = run.moves[index]
  if (!current) return run
  const resolution = resolveMove(current.facts)
  const card = resolution.status === "card" ? resolution.card : null
  const move = { ...current, card, changedAfterDisambiguation: changedAfterDisambiguation(current.log) }
  const patched = patchMove(run, index, move)
  if (resolution.status === "ask") return { ...patched, screen: "clarify", editing: index }
  return { ...patched, screen: "card", editing: index }
}

export function submitAnswer(run: Run, answer: ClosedAnswer, optionTexts?: string[]): Run {
  if (run.screen !== "clarify" && run.screen !== "card") return run
  const current = editingMove(run)
  if (!current) return run
  const facts = applyAnswer(current.facts, answer)
  const recorded: ClosedAnswer = {
    pair: answer.pair,
    answer: answer.answer,
    optionCount: answer.optionCount,
  }
  if (answer.pair === "waiting-object") recorded.waitingObject = answer.waitingObject ?? answer.answer
  const move: Move = {
    ...current,
    facts,
    answers: [...current.answers, recorded],
    log: [...current.log, recorded],
    optionTexts: optionTexts ?? current.optionTexts,
  }
  return placeAfterFacts(patchMove(run, run.editing, move), run.editing)
}

export function reopenClarification(run: Run): Run {
  const current = editingMove(run)
  if (!current) return run
  if (current.answers.length === 0) return { ...run, screen: "act" }
  const answers = current.answers.slice(0, -1)
  const move: Move = {
    ...current,
    answers,
    facts: applyAll(answers),
    card: null,
    recognition: null,
  }
  return { ...patchMove(run, run.editing, move), screen: "clarify" }
}

export function recognitionDue(run: Run): boolean {
  const move = editingMove(run)
  if (!move) return false
  return showRecognition(run.editing + 1, move.card)
}

export function continueFromCard(run: Run): Run {
  if (run.screen !== "card") return run
  if (recognitionDue(run)) return run
  return { ...run, screen: "happened" }
}

export function submitRecognition(run: Run, value: Recognition): Run {
  if (run.screen !== "card") return run
  const current = editingMove(run)
  if (!current) return run
  return { ...patchMove(run, run.editing, { ...current, recognition: value }), screen: "happened" }
}

export function submitHappened(run: Run, raw: string): Run | StepError {
  if (run.screen !== "happened") return run
  const text = clean(raw)
  if (!text) return "empty"
  const current = editingMove(run)
  if (!current) return run
  return patchMove(run, run.editing, { ...current, happenedText: text })
}

export function beginNextMove(run: Run): Run {
  if (run.screen !== "happened") return run
  const current = editingMove(run)
  if (!current || !current.happenedText.trim()) return run
  const following = run.moves[run.editing + 1]
  if (following) {
    const screen = current.card === "flight" && !following.actText.trim() ? "link" : "act"
    return { ...run, editing: run.editing + 1, screen }
  }
  const move = blankMove()
  if (current.card !== "flight") move.continuation = "same"
  const moves = [...run.moves, move]
  return {
    ...run,
    moves,
    editing: moves.length - 1,
    screen: current.card === "flight" ? "link" : "act",
  }
}

export function submitContinuation(run: Run, continuation: Continuation): Run {
  if (run.screen !== "link") return run
  const current = editingMove(run)
  if (!current) return run
  return { ...patchMove(run, run.editing, { ...current, continuation }), screen: "act" }
}

export function openRoute(run: Run): Run {
  if (run.screen !== "happened" && run.screen !== "fork") return run
  const current = run.moves[run.editing]
  if (run.screen === "happened" && (!current || !current.happenedText.trim() || !current.actText.trim())) return run
  return { ...run, screen: "route" }
}

export function openFork(run: Run): Run {
  if (run.screen !== "route" || run.moves.length === 0) return run
  return { ...run, screen: "fork", forkIndex: run.forkIndex ?? 0 }
}

export function chooseFork(run: Run, index: number): Run {
  if (run.screen !== "fork") return run
  if (!Number.isInteger(index) || index < 0 || index >= run.moves.length) return run
  const same = run.moves[index]?.card !== null && run.alternativeCard === run.moves[index]?.card
  return { ...run, forkIndex: index, alternativeCard: same ? null : run.alternativeCard }
}

export function chooseAlternative(run: Run, card: CardId): Run | StepError {
  if (run.screen !== "fork" || run.forkIndex === null) return run
  if (!isCardId(card)) return run
  const current = run.moves[run.forkIndex]?.card
  if (current && current === card) return "same"
  return { ...run, alternativeCard: card }
}

export function openCompare(run: Run): Run {
  if (run.screen !== "fork" || run.forkIndex === null || !run.alternativeCard) return run
  return { ...run, screen: "compare" }
}

export function couldCards(run: Run): (CardId | null)[] {
  return run.moves.map((move, index) => (index === run.forkIndex && run.alternativeCard ? run.alternativeCard : move.card))
}

export function submitTry(run: Run, raw: string): Run | StepError {
  if (run.screen !== "compare") return run
  const text = clean(raw)
  if (!text) return "empty"
  return { ...run, tryAction: text, screen: "result" }
}

export function goBack(run: Run): Run {
  switch (run.screen) {
    case "home":
      return run
    case "situation":
      return { ...run, screen: "home" }
    case "link": {
      const current = editingMove(run)
      if (current && !current.actText.trim()) return dropEmptyDraft(run, "happened")
      return { ...run, screen: "happened", editing: Math.max(0, run.editing - 1) }
    }
    case "act": {
      const current = editingMove(run)
      if (run.editing > 0 && current && !current.actText.trim()) return dropEmptyDraft(run, "happened")
      if (run.editing === 0) return { ...run, screen: "situation" }
      if (run.moves[run.editing - 1]?.card === "flight") return { ...run, screen: "link" }
      return { ...run, screen: "happened", editing: run.editing - 1 }
    }
    case "clarify":
      return { ...run, screen: "act" }
    case "card":
      return { ...run, screen: "act" }
    case "happened":
      return { ...run, screen: "card" }
    case "route":
      return { ...run, screen: "happened", editing: Math.max(0, run.moves.length - 1) }
    case "fork":
      return { ...run, screen: "route" }
    case "compare":
      return { ...run, screen: "fork" }
    case "result":
      return { ...run, screen: "compare" }
    default:
      return run
  }
}

function dropEmptyDraft(run: Run, screen: ScreenId): Run {
  const moves = run.moves.slice(0, -1)
  return { ...run, moves, editing: Math.max(0, moves.length - 1), screen }
}

export function clarifyAt(run: Run, index: number): Run {
  if (!run.moves[index]) return run
  const focused = { ...run, editing: index }
  const resolution = resolveMove(run.moves[index].facts)
  if (resolution.status === "ask") return { ...focused, screen: "clarify" }
  return reopenClarification(focused)
}

export function contactCode(move: Move | null): "none" | "started" | "ended" | null {
  if (!move) return null
  if (move.facts.startedThenStopped === true) return "ended"
  if (move.facts.substantialContact === true) return "started"
  if (move.facts.substantialContact === false) return "none"
  return null
}

export function moveTitle(card: CardId | null): string {
  return card ? CARD_NAME[card] : UNRESOLVED_LABEL
}

export const STORAGE_KEY = "olno.currentRun"

export function loadRun(raw: string | null): Run {
  if (!raw) return createRun()
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRun(parsed)) return createRun()
    return parsed
  } catch {
    return createRun()
  }
}

export function saveRun(run: Run, storage: { setItem: (key: string, value: string) => void; removeItem: (key: string) => void }): void {
  if (run.screen === "home" && run.situationText === "" && run.moves.length === 0) {
    storage.removeItem(STORAGE_KEY)
    return
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(run))
}

function isRun(value: unknown): value is Run {
  if (!value || typeof value !== "object") return false
  const run = value as Run
  if (run.version !== 3 || !SCREENS.some((screen) => screen === run.screen)) return false
  if (typeof run.sessionId !== "string" || typeof run.situationText !== "string") return false
  if (!Array.isArray(run.moves)) return false
  return run.moves.every((move) => {
    if (!move || typeof move !== "object") return false
    if (typeof move.actText !== "string" || typeof move.happenedText !== "string") return false
    if (move.card !== null && !isCardId(move.card)) return false
    return Boolean(move.facts)
  })
}
