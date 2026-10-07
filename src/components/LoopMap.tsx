import type { CSSProperties, ReactNode } from "react"
import { PathMark } from "@/components/PathMark"
import { NODE_IDS, type NodeId } from "@/game/types"
import { cn } from "cn"

export type LoopNodeView = {
  id: NodeId
  title: string
  text: string
  placeLabel?: string
}

type LoopMapProps = {
  nodes: readonly LoopNodeView[]
  branch?: readonly LoopNodeView[]
  draw?: "enter" | "still"
  activeId?: NodeId
  keptCaption?: string
  branchCaption?: string
  variant?: "stage" | "panel"
  center?: ReactNode
  className?: string
}

const MARK_AT: Record<NodeId, string> = {
  situation: "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  inside: "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  action: "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
  consequence: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
}

export function LoopMap({
  nodes,
  branch,
  draw = "enter",
  activeId,
  keptCaption,
  branchCaption,
  variant = "stage",
  center,
  className,
}: LoopMapProps) {
  const ordered = NODE_IDS.flatMap((id) => {
    const node = nodes.find((item) => item.id === id)
    return node ? [node] : []
  })
  const changed = branch?.find((item) => {
    const current = nodes.find((node) => node.id === item.id)
    return current && current.text !== item.text
  })
  const branchSide = changed?.id === "consequence" ? "left" : changed ? "right" : "none"

  return (
    <div
      className={cn(
        "w-full",
        variant === "stage" ? "md:min-h-[calc(100dvh-4.5rem)]" : "md:h-[calc(100dvh-6.5rem)] md:min-h-[28rem]",
        className,
      )}
    >
      <PhoneLoop
        ordered={ordered}
        changed={changed}
        draw={draw}
        activeId={activeId}
        keptCaption={keptCaption}
        branchCaption={branchCaption}
      />
      <div
        className={cn(
          "relative hidden h-full w-full md:grid md:grid-rows-[auto_minmax(12rem,1fr)_auto]",
          branchSide === "right" &&
            "md:grid-cols-[minmax(9.5rem,0.8fr)_minmax(12rem,1.15fr)_minmax(18rem,1.25fr)]",
          branchSide === "left" &&
            "md:grid-cols-[minmax(18rem,1.25fr)_minmax(12rem,1.15fr)_minmax(9.5rem,0.8fr)]",
          branchSide === "none" && "md:grid-cols-[minmax(11rem,0.9fr)_minmax(16rem,1.4fr)_minmax(11rem,0.9fr)]",
          variant === "stage" ? "min-h-[calc(100dvh-4.5rem)]" : "h-full min-h-[28rem]",
        )}
      >
        {ordered.map((node) => (
          <CornerCopy
            key={node.id}
            node={node}
            draw={draw}
            dim={Boolean(activeId && activeId !== node.id)}
            changed={changed?.id === node.id ? changed : undefined}
            keptCaption={keptCaption}
            branchCaption={branchCaption}
          />
        ))}
        <div className="relative col-start-2 row-start-2 min-h-[12rem]">
          <svg
            className="pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M 0 0 H 100 V 100 H 0 Z"
              fill="none"
              stroke="var(--olno-gold)"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pathLength={100}
              className={cn(draw === "enter" ? "path-draw" : "path-still", changed && "opacity-45")}
            />
          </svg>
          {center ? (
            <div className="pointer-events-none absolute inset-[11%] flex items-center justify-center">{center}</div>
          ) : null}
          {ordered.map((node, index) => (
            <span key={node.id} className={cn("absolute z-[1]", MARK_AT[node.id])}>
              <span
                className={cn("block", draw === "enter" && "node-ring")}
                style={draw === "enter" ? ({ "--d": `${0.12 + index * 0.62}s` } as CSSProperties) : undefined}
              >
                <PathMark active={activeId === node.id} quiet={changed?.id === node.id} />
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function CornerCopy({
  node,
  draw,
  dim,
  changed,
  keptCaption,
  branchCaption,
}: {
  node: LoopNodeView
  draw: "enter" | "still"
  dim: boolean
  changed?: LoopNodeView
  keptCaption?: string
  branchCaption?: string
}) {
  const delay = `${0.12 + NODE_IDS.indexOf(node.id) * 0.62}s`
  const copyClass = cn(
    "min-w-0 break-words",
    draw === "enter" && "node-copy",
    changed && "opacity-50",
    dim && "opacity-55",
  )
  const copyStyle = draw === "enter" ? ({ "--d": delay } as CSSProperties) : undefined
  const place =
    node.id === "situation" ? "tl" : node.id === "inside" ? "tr" : node.id === "action" ? "br" : "bl"

  if (!changed) {
    return (
      <div className={cn("flex min-w-0", PLACE_FRAME[place])} data-node={node.id}>
        <Copy node={node} className={cn(copyClass, "max-w-[16rem]")} style={copyStyle} />
      </div>
    )
  }

  const railFirst = place === "br" || place === "bl"
  return (
    <div
      className={cn("grid min-w-0 grid-cols-2 gap-x-4", place === "tr" ? "items-end" : "items-start", PLACE_CELL[place])}
      data-node={node.id}
    >
      {railFirst ? <BranchRail from={place === "bl" ? "right" : "left"} /> : null}
      {place === "bl" ? <BranchText node={changed} caption={branchCaption} /> : null}
      <Copy
        node={node}
        caption={keptCaption}
        className={cn(copyClass, TEXT_PAD[place], place === "tl" || place === "bl" ? "text-right" : "text-left")}
        style={copyStyle}
      />
      {place !== "bl" ? <BranchText node={changed} caption={branchCaption} /> : null}
      {place === "tr" ? <BranchRail from="left" /> : null}
    </div>
  )
}

const PLACE_CELL: Record<"tl" | "tr" | "br" | "bl", string> = {
  tl: "col-start-1 row-start-1 self-end",
  tr: "col-start-3 row-start-1 self-end",
  br: "col-start-3 row-start-3 self-start",
  bl: "col-start-1 row-start-3 self-start",
}

const PLACE_FRAME: Record<"tl" | "tr" | "br" | "bl", string> = {
  tl: "col-start-1 row-start-1 self-end items-end justify-end pr-10 pb-5 text-right",
  tr: "col-start-3 row-start-1 self-end items-end justify-start pb-5 pl-10",
  br: "col-start-3 row-start-3 self-start items-start justify-start pt-5 pl-10",
  bl: "col-start-1 row-start-3 self-start items-start justify-end pt-5 pr-10 text-right",
}

const TEXT_PAD: Record<"tl" | "tr" | "br" | "bl", string> = {
  tl: "pr-10 pb-5",
  tr: "pb-4 pl-10",
  br: "pt-4 pl-10",
  bl: "pt-4 pr-10",
}

function Copy({
  node,
  caption,
  className,
  style,
}: {
  node: LoopNodeView
  caption?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={className} style={style}>
      {caption ? <p className="text-xs tracking-wide text-[var(--olno-gold)]">{caption}</p> : null}
      <p className="text-sm text-[var(--olno-burgundy-soft)]">{node.title}</p>
      <p className="mt-1 text-base leading-snug text-[var(--olno-burgundy)]">{node.text}</p>
    </div>
  )
}

function BranchText({ node, caption, align = "left" }: { node: LoopNodeView; caption?: string; align?: "left" | "right" }) {
  return (
    <div className={cn("node-copy min-w-0 break-words", align === "right" && "text-right")} style={{ "--d": "0.35s" } as CSSProperties}>
      {caption ? <p className="text-xs tracking-wide text-[var(--olno-gold)]">{caption}</p> : null}
      {node.placeLabel ? <p className="mt-1 text-xs text-[var(--olno-gold)]">{node.placeLabel}</p> : null}
      <p className="mt-1 text-sm text-[var(--olno-burgundy-soft)]">{node.title}</p>
      <p className="mt-1 text-base leading-snug text-[var(--olno-burgundy)]">{node.text}</p>
    </div>
  )
}

function BranchRail({ from }: { from: "left" | "right" }) {
  const outward = from === "left"
  return (
    <div className="relative col-span-2 h-8" data-node="branch">
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
        <path
          d={outward ? "M 0 16 H 72" : "M 100 16 H 28"}
          fill="none"
          stroke="var(--olno-gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={100}
          className="path-draw"
        />
      </svg>
      <span className={cn("absolute top-1/2 -translate-x-1/2 -translate-y-1/2", outward ? "left-[72%]" : "left-[28%]")}>
        <span className="node-ring block" style={{ "--d": "0.2s" } as CSSProperties}>
          <PathMark active />
        </span>
      </span>
    </div>
  )
}

function PhoneLoop({
  ordered,
  changed,
  draw,
  activeId,
  keptCaption,
  branchCaption,
}: {
  ordered: LoopNodeView[]
  changed: LoopNodeView | undefined
  draw: "enter" | "still"
  activeId?: NodeId
  keptCaption?: string
  branchCaption?: string
}) {
  return (
    <div className="relative md:hidden">
      <svg className="pointer-events-none absolute top-0 left-0 h-full w-14" viewBox="0 0 56 100" preserveAspectRatio="none" aria-hidden>
        <path
          d="M 28 4 V 96"
          fill="none"
          stroke="var(--olno-gold)"
          strokeWidth="1.35"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={100}
          className={draw === "enter" ? "path-draw" : "path-still"}
        />
      </svg>
      <ol aria-label="Петля" className="relative z-[1] m-0 grid list-none gap-8 p-0">
        {ordered.map((node, index) => {
          const delay = `${0.1 + index * 0.45}s`
          const isChanged = changed?.id === node.id
          const dim = Boolean(activeId && activeId !== node.id)
          return (
            <li key={node.id} data-node={node.id}>
              <div className="flex items-start gap-3">
                <span
                  className={cn("flex w-14 shrink-0 justify-center", draw === "enter" && "node-ring")}
                  style={draw === "enter" ? ({ "--d": delay } as CSSProperties) : undefined}
                >
                  <PathMark active={activeId === node.id} quiet={isChanged && Boolean(changed)} />
                </span>
                <div
                  className={cn("min-w-0 flex-1 pt-1", draw === "enter" && "node-copy", isChanged && changed && "opacity-50", dim && "opacity-55")}
                  style={draw === "enter" ? ({ "--d": delay } as CSSProperties) : undefined}
                >
                  {isChanged && keptCaption ? (
                    <p className="text-xs tracking-wide text-[var(--olno-gold)]">{keptCaption}</p>
                  ) : null}
                  <p className="text-sm text-[var(--olno-burgundy-soft)]">{node.title}</p>
                  <p className="mt-1 text-base leading-snug break-words">{node.text}</p>
                </div>
              </div>
              {isChanged && changed ? (
                <div className="mt-4 ml-14 flex items-start gap-3 border-l border-[var(--olno-gold)] pl-3" data-node="branch">
                  <PathMark active />
                  <div className="min-w-0">
                    {branchCaption ? <p className="text-xs tracking-wide text-[var(--olno-gold)]">{branchCaption}</p> : null}
                    {changed.placeLabel ? <p className="mt-1 text-xs text-[var(--olno-gold)]">{changed.placeLabel}</p> : null}
                    <p className="mt-1 text-sm text-[var(--olno-burgundy-soft)]">{changed.title}</p>
                    <p className="mt-1 text-base leading-snug break-words">{changed.text}</p>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
