/**
 * One player builds a map of one situation.
 * No scores, levels, types, or diagnosis.
 */

export const SCREENS = [
  "home",
  "situation",
  "node",
  "loop",
  "alternative",
  "second-map",
  "consult",
] as const

export type ScreenId = (typeof SCREENS)[number]

export const NODE_IDS = ["situation", "inside", "action", "consequence"] as const

export type NodeId = (typeof NODE_IDS)[number]

export const PLACE_IDS = ["thought", "expectation", "action", "reaction"] as const

export type PlaceId = (typeof PLACE_IDS)[number]

export const TEXT_SOURCES = ["card", "own"] as const

export type TextSource = (typeof TEXT_SOURCES)[number]

export type NodeText = {
  text: string
  source: TextSource
}

export type GameState = {
  version: 2
  screen: ScreenId
  situationText: string
  situationSource: TextSource | null
  nodes: Record<NodeId, NodeText | null>
  chosenPlace: PlaceId | null
  alternativeText: string
  alternativeSource: TextSource | null
}
