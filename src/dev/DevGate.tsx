import { useEffect, useState, type ComponentType } from "react"
import type { GameState } from "@/game/types"

type PanelProps = {
  state: GameState
  onChange: (next: GameState) => void
}

export function DevGate({ state, onChange }: PanelProps) {
  const [Panel, setPanel] = useState<ComponentType<PanelProps> | null>(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (new URLSearchParams(window.location.search).get("dev") !== "1") return
    let alive = true
    void import("./DevPanel").then((mod) => {
      if (alive) setPanel(() => mod.DevPanel)
    })
    return () => {
      alive = false
    }
  }, [])

  if (!import.meta.env.DEV || Panel === null) return null
  return <Panel state={state} onChange={onChange} />
}
