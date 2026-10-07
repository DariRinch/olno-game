import { cn } from "cn"
import type { NodeId } from "@/game/types"

export type LoopNodeView = {
  id: NodeId
  title: string
  text: string
  placeLabel?: string
}

const positions: Record<NodeId, string> = {
  situation: "col-start-1 row-start-1",
  inside: "col-start-3 row-start-1",
  action: "col-start-3 row-start-3",
  consequence: "col-start-1 row-start-3",
}

function FlowArrow({ direction }: { direction: "right" | "left" | "up" | "down" }) {
  const rotate = { right: 0, down: 90, left: 180, up: 270 }[direction]
  return (
    <span className="flex items-center justify-center text-copper" aria-hidden>
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <path
          d="M4 12h14M14 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function LoopMap({ nodes }: { nodes: readonly LoopNodeView[] }) {
  const byId = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_1.25rem_minmax(0,1fr)] grid-rows-[auto_1.5rem_auto] gap-x-1.5 gap-y-1">
      {nodes.map((node) => {
        const view = byId.get(node.id)
        if (!view) return null
        const changed = Boolean(view.placeLabel)
        return (
          <article
            key={view.id}
            data-node={view.id}
            className={cn(
              "h-full rounded-2xl border bg-card px-3 py-3",
              positions[view.id],
              changed ? "border-copper" : "border-border",
            )}
          >
            <p className="text-[0.68rem] tracking-wide text-muted-foreground uppercase">
              {view.title}
            </p>
            {view.placeLabel ? (
              <p className="mt-1 text-xs text-copper">{view.placeLabel}</p>
            ) : null}
            <p className="mt-2 text-sm leading-snug break-words text-foreground">{view.text}</p>
          </article>
        )
      })}
      <div className="col-start-2 row-start-1 flex items-center justify-center">
        <FlowArrow direction="right" />
      </div>
      <div className="col-start-3 row-start-2 flex items-center justify-center">
        <FlowArrow direction="down" />
      </div>
      <div className="col-start-2 row-start-3 flex items-center justify-center">
        <FlowArrow direction="left" />
      </div>
      <div className="col-start-1 row-start-2 flex items-center justify-center">
        <FlowArrow direction="up" />
      </div>
    </div>
  )
}
