import { createInitialState, currentNodeId, nodesAreComplete } from "./state"
import { NODE_IDS, type GameState, type NodeId, type PlaceId, type TextSource } from "./types"

/**
 * The player names one situation, then four nodes, in order.
 * A choice of phrase or their own words only fills that node.
 * Nothing is scored. The second map replaces a single place
 * with their alternative and leaves the other nodes as they were.
 *
 * мысль and ожидание sit in Внутри.
 * действие replaces Действие.
 * реакция replaces Последствие.
 * Ситуация stays.
 */

const TEXT_LIMIT = 280

export type StepError = "empty"

export function openSituation(state: GameState): GameState {
  if (state.screen !== "home") return state
  return { ...state, screen: "situation" }
}

export function submitSituation(
  state: GameState,
  raw: string,
  source: TextSource,
): GameState | StepError {
  if (state.screen !== "situation") return state
  const text = cleanText(raw)
  if (!text) return "empty"
  return {
    ...createInitialState(),
    screen: "node",
    situationText: text,
    situationSource: source,
  }
}

export function submitNode(
  state: GameState,
  nodeId: NodeId,
  raw: string,
  source: TextSource,
): GameState | StepError {
  if (state.screen !== "node" || currentNodeId(state) !== nodeId) return state
  const text = cleanText(raw)
  if (!text) return "empty"

  const nodes = { ...state.nodes, [nodeId]: { text, source } }
  const filled = NODE_IDS.every((id) => nodes[id] !== null)
  return {
    ...state,
    nodes,
    screen: filled ? "loop" : "node",
  }
}

export function openAlternative(state: GameState): GameState {
  if (state.screen !== "loop" || !nodesAreComplete(state)) return state
  return { ...state, screen: "alternative" }
}

export function submitAlternative(
  state: GameState,
  place: PlaceId,
  raw: string,
  source: TextSource,
): GameState | StepError {
  if (state.screen !== "alternative") return state
  const text = cleanText(raw)
  if (!text) return "empty"
  return {
    ...state,
    screen: "second-map",
    chosenPlace: place,
    alternativeText: text,
    alternativeSource: source,
  }
}

export function openConsult(state: GameState): GameState {
  if (state.screen !== "second-map") return state
  return { ...state, screen: "consult" }
}

export function returnToMap(state: GameState): GameState {
  if (state.screen !== "consult") return state
  return { ...state, screen: "second-map" }
}

export function startNewGame(): GameState {
  return createInitialState()
}

export function changedNodeId(place: PlaceId): NodeId {
  if (place === "thought" || place === "expectation") return "inside"
  if (place === "action") return "action"
  return "consequence"
}

export function loopTexts(state: GameState, variant: "now" | "otherwise"): Record<NodeId, string> | null {
  if (!nodesAreComplete(state)) return null
  const texts = {
    situation: state.nodes.situation!.text,
    inside: state.nodes.inside!.text,
    action: state.nodes.action!.text,
    consequence: state.nodes.consequence!.text,
  }
  if (variant === "now") return texts
  if (!state.chosenPlace || !state.alternativeText.trim()) return null
  return {
    ...texts,
    [changedNodeId(state.chosenPlace)]: state.alternativeText,
  }
}

function cleanText(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, TEXT_LIMIT)
}
