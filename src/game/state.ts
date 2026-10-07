import { nodeMeta } from "./cards"
import {
  NODE_IDS,
  PLACE_IDS,
  SCREENS,
  TEXT_SOURCES,
  type GameState,
  type NodeId,
  type NodeText,
  type PlaceId,
  type ScreenId,
  type TextSource,
} from "./types"

export const STORAGE_KEY = "olno.currentRun"

export function emptyNodes(): GameState["nodes"] {
  return {
    situation: null,
    inside: null,
    action: null,
    consequence: null,
  }
}

export function createInitialState(): GameState {
  return {
    version: 2,
    screen: "home",
    situationText: "",
    situationSource: null,
    nodes: emptyNodes(),
    chosenPlace: null,
    alternativeText: "",
    alternativeSource: null,
  }
}

export function isPristineHome(state: GameState): boolean {
  return (
    state.screen === "home" &&
    state.situationText === "" &&
    state.situationSource === null &&
    state.chosenPlace === null &&
    state.alternativeText === "" &&
    state.alternativeSource === null &&
    NODE_IDS.every((id) => state.nodes[id] === null)
  )
}

export function currentNodeId(state: GameState): NodeId | null {
  return NODE_IDS.find((id) => state.nodes[id] === null) ?? null
}

export function nodeTitle(id: NodeId): string {
  return nodeMeta[id].title
}

export function nodesAreComplete(state: GameState): boolean {
  return NODE_IDS.every((id) => state.nodes[id] !== null)
}

export function loadRun(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed: unknown = JSON.parse(raw)
    if (!isGameState(parsed)) return createInitialState()
    return parsed
  } catch {
    return createInitialState()
  }
}

export function saveRun(state: GameState): void {
  if (isPristineHome(state)) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearRun(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isScreen(value: unknown): value is ScreenId {
  return typeof value === "string" && SCREENS.some((screen) => screen === value)
}

function isSource(value: unknown): value is TextSource {
  return typeof value === "string" && TEXT_SOURCES.some((source) => source === value)
}

function isPlace(value: unknown): value is PlaceId {
  return typeof value === "string" && PLACE_IDS.some((place) => place === value)
}

function isNodeText(value: unknown): value is NodeText {
  return isRecord(value) && typeof value.text === "string" && value.text.trim() !== "" && isSource(value.source)
}

function nodesArePrefix(nodes: unknown): nodes is GameState["nodes"] {
  if (!isRecord(nodes)) return false
  let seenEmpty = false
  for (const id of NODE_IDS) {
    const node = nodes[id]
    if (node === null) {
      seenEmpty = true
      continue
    }
    if (seenEmpty || !isNodeText(node)) return false
  }
  return true
}

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value) || value.version !== 2 || !isScreen(value.screen)) return false
  if (typeof value.situationText !== "string") return false
  if (value.situationSource !== null && !isSource(value.situationSource)) return false
  const nodes = value.nodes
  if (!nodesArePrefix(nodes)) return false
  if (value.chosenPlace !== null && !isPlace(value.chosenPlace)) return false
  if (typeof value.alternativeText !== "string") return false
  if (value.alternativeSource !== null && !isSource(value.alternativeSource)) return false

  const complete = NODE_IDS.every((id) => isNodeText(nodes[id]))
  const hasAlternative = value.alternativeText.trim() !== "" && value.alternativeSource !== null && value.chosenPlace !== null

  if (value.screen === "node" && (value.situationText.trim() === "" || complete)) return false
  if ((value.screen === "loop" || value.screen === "alternative") && !complete) return false
  if ((value.screen === "second-map" || value.screen === "consult") && (!complete || !hasAlternative)) return false
  return true
}
