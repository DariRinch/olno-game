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
    ...state,
    screen: "node",
    situationText: text,
    situationSource: source,
    focus: state.nodes.situation ? "situation" : null,
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
  const nextId = NODE_IDS[NODE_IDS.indexOf(nodeId) + 1]
  if (!nextId) return { ...state, nodes, screen: "loop", focus: null }
  if (nodes[nextId]) return { ...state, nodes, screen: "node", focus: nextId }
  return { ...state, nodes, screen: "node", focus: null }
}

/** One screen backward. Written nodes, the alternative, and the situation stay in the run. */
export function goBack(state: GameState): GameState {
  switch (state.screen) {
    case "home":
      return state
    case "situation":
      return { ...state, screen: "home", focus: null }
    case "node": {
      const id = state.focus ?? currentNodeId(state)
      if (!id) return { ...state, screen: "situation", focus: null }
      const index = NODE_IDS.indexOf(id)
      if (index <= 0) return { ...state, screen: "situation", focus: null }
      const prev = NODE_IDS[index - 1]
      if (!state.nodes[prev]) return { ...state, screen: "situation", focus: null }
      return { ...state, screen: "node", focus: prev }
    }
    case "loop":
      return { ...state, screen: "node", focus: "consequence" }
    case "alternative":
      return { ...state, screen: "loop", focus: null }
    case "second-map":
      return { ...state, screen: "alternative", focus: null }
    case "consult":
      return { ...returnToMap(state), focus: null }
    default:
      return state
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
