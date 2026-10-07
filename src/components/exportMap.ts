import type { LoopNodeView } from "@/components/LoopMap"
import { NODE_IDS } from "@/game/types"

const WIDTH = 1400
const PADDING = 72
const TEXT_WIDTH = 360

const IVORY = "#FBF7F0"
const BURGUNDY = "#4A1424"
const GOLD = "#8A6A2F"
const SOFT = "rgba(74, 20, 36, 0.66)"

export async function downloadMapPng(input: {
  now: readonly LoopNodeView[]
  otherwise: readonly LoopNodeView[]
}): Promise<void> {
  await document.fonts.ready
  await document.fonts.load("600 42px 'Literata Variable'")
  await document.fonts.load("400 22px 'Geist Variable'")
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")

  const placed = layout(ctx, input.now, input.otherwise)
  const height = Math.max(...placed.map((item) => item.bottom)) + PADDING

  const scale = 2
  canvas.width = WIDTH * scale
  canvas.height = height * scale
  ctx.scale(scale, scale)

  ctx.fillStyle = IVORY
  ctx.fillRect(0, 0, WIDTH, height)

  ctx.fillStyle = "rgba(74, 20, 36, 0.05)"
  ctx.beginPath()
  ctx.ellipse(WIDTH - 180, 120, 160, 110, 0.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = BURGUNDY
  ctx.font = "600 42px 'Literata Variable', Georgia, serif"
  ctx.textAlign = "left"
  ctx.fillText("ОЛНО", PADDING, PADDING + 28)

  const main = placed.filter((item) => item.kind === "main")
  strokeLoop(
    ctx,
    main.map((item) => ({ x: item.cx, y: item.cy })),
  )
  const branch = placed.find((item) => item.kind === "branch")
  const from = main.find((item) => item.id === branch?.id)
  if (branch && from) {
    ctx.strokeStyle = GOLD
    ctx.lineWidth = 1.6
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(from.cx, from.cy)
    ctx.lineTo(branch.cx, branch.cy)
    ctx.stroke()
  }

  for (const item of placed) drawNode(ctx, item)

  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = "olno-karta.png"
  link.click()
}

type Placed = {
  kind: "main" | "branch"
  id: LoopNodeView["id"]
  cx: number
  cy: number
  textX: number
  align: CanvasTextAlign
  title: string
  text: string
  caption?: string
  placeLabel?: string
  quiet: boolean
  bottom: number
}

const CORNER: Record<LoopNodeView["id"], { cx: number; cy: number; align: CanvasTextAlign; textX: number; above: boolean }> = {
  situation: { cx: 380, cy: 340, align: "right", textX: 348, above: true },
  inside: { cx: 1020, cy: 340, align: "left", textX: 1052, above: true },
  action: { cx: 1020, cy: 820, align: "left", textX: 1052, above: false },
  consequence: { cx: 380, cy: 820, align: "right", textX: 348, above: false },
}

function layout(
  ctx: CanvasRenderingContext2D,
  now: readonly LoopNodeView[],
  otherwise: readonly LoopNodeView[],
): Placed[] {
  const placed: Placed[] = []
  for (const id of NODE_IDS) {
    const node = now.find((item) => item.id === id)
    const alt = otherwise.find((item) => item.id === id)
    if (!node) continue
    const spot = CORNER[id]
    const changed = Boolean(alt && alt.text !== node.text)
    const block = measureBlock(ctx, node.text, changed ? "Как происходит сейчас" : undefined, undefined)
    placed.push({
      kind: "main",
      id,
      cx: spot.cx,
      cy: spot.cy,
      textX: spot.textX,
      align: spot.align,
      title: node.title,
      text: node.text,
      caption: changed ? "Как происходит сейчас" : undefined,
      quiet: changed,
      bottom: spot.above ? spot.cy : spot.cy + block,
    })
    if (changed && alt) {
      const outward = id === "situation" || id === "consequence" ? -150 : 150
      const down = id === "situation" || id === "inside" ? -120 : 120
      placed.push({
        kind: "branch",
        id,
        cx: spot.cx + outward,
        cy: spot.cy + down,
        textX: spot.cx + outward + (outward < 0 ? -28 : 28),
        align: outward < 0 ? "right" : "left",
        title: alt.title,
        text: alt.text,
        caption: "Как могло бы быть иначе",
        placeLabel: alt.placeLabel,
        quiet: false,
        bottom: spot.cy + down + measureBlock(ctx, alt.text, "Как могло бы быть иначе", alt.placeLabel),
      })
    }
  }
  return placed
}

function measureBlock(ctx: CanvasRenderingContext2D, text: string, caption?: string, place?: string) {
  ctx.font = "400 22px 'Geist Variable', sans-serif"
  const lines = wrap(ctx, text, TEXT_WIDTH)
  return 22 + (caption ? 22 : 0) + (place ? 20 : 0) + lines.length * 30 + 8
}

function drawNode(ctx: CanvasRenderingContext2D, item: Placed) {
  ctx.beginPath()
  ctx.arc(item.cx, item.cy, 15, 0, Math.PI * 2)
  ctx.fillStyle = IVORY
  ctx.fill()
  ctx.strokeStyle = item.quiet ? "rgba(74, 20, 36, 0.4)" : BURGUNDY
  ctx.lineWidth = item.kind === "branch" ? 2 : 1.25
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(item.cx, item.cy, 2.6, 0, Math.PI * 2)
  ctx.fillStyle = GOLD
  ctx.fill()

  ctx.textAlign = item.align
  ctx.textBaseline = "top"
  ctx.font = "400 22px 'Geist Variable', sans-serif"
  const lines = wrap(ctx, item.text, TEXT_WIDTH)
  const block = 22 + (item.caption ? 22 : 0) + (item.placeLabel ? 20 : 0) + lines.length * 30
  const above = item.cy < 560
  let textY = above ? item.cy - 28 - block : item.cy + 28
  ctx.font = "500 14px 'Geist Variable', sans-serif"
  if (item.caption) {
    ctx.fillStyle = GOLD
    ctx.fillText(item.caption, item.textX, textY)
    textY += 22
  }
  ctx.fillStyle = SOFT
  ctx.fillText(item.title, item.textX, textY)
  textY += 22
  if (item.placeLabel) {
    ctx.fillStyle = GOLD
    ctx.fillText(item.placeLabel, item.textX, textY)
    textY += 20
  }
  ctx.fillStyle = item.quiet ? "rgba(74, 20, 36, 0.55)" : BURGUNDY
  ctx.font = "400 22px 'Geist Variable', sans-serif"
  for (const line of lines) {
    ctx.fillText(line, item.textX, textY)
    textY += 30
  }
}

function strokeLoop(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  if (points.length < 2) return
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 1.6
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y)
  ctx.closePath()
  ctx.stroke()
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    const parts = ctx.measureText(word).width > maxWidth ? breakWord(ctx, word, maxWidth) : [word]
    for (const part of parts) {
      const next = line ? `${line} ${part}` : part
      if (ctx.measureText(next).width > maxWidth && line) {
        lines.push(line)
        line = part
      } else {
        line = next
      }
    }
  }
  if (line) lines.push(line)
  return lines.length > 0 ? lines : [""]
}

function breakWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number): string[] {
  const parts: string[] = []
  let chunk = ""
  for (const char of word) {
    const next = chunk + char
    if (ctx.measureText(next).width > maxWidth && chunk) {
      parts.push(chunk)
      chunk = char
    } else {
      chunk = next
    }
  }
  if (chunk) parts.push(chunk)
  return parts
}
