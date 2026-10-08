import type { CardId } from "./cards"

export const TRANSITIONS = ["DIRECT", "CONDITIONAL", "REENTRY", "INVALID"] as const

export type TransitionKind = (typeof TRANSITIONS)[number]

export type Continuation = "same" | "new-event" | "new-entry"

/**
 * A check beside the route, not a rule that chooses the next move.
 * The next move is whatever the person actually did.
 * Бегство is not the end of the route.
 */
const CONTACT_ALREADY: readonly CardId[] = ["adaptation", "holding", "control", "acceleration", "flight"]

export function tagTransition(
  previous: CardId | null,
  next: CardId | null,
  continuation: Continuation | null,
): TransitionKind {
  if (previous === "flight") {
    if (continuation === "new-entry") return "REENTRY"
    if (continuation === "new-event") return "CONDITIONAL"
    return "INVALID"
  }
  if (
    next === "avoidance" &&
    continuation === "same" &&
    previous !== null &&
    CONTACT_ALREADY.includes(previous)
  ) {
    return "INVALID"
  }
  if (continuation === "new-entry") return "REENTRY"
  if (continuation === "new-event") return "CONDITIONAL"
  return "DIRECT"
}
