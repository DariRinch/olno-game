import type { LoopNodeView } from "@/components/LoopMap"

const WIDTH = 1080
const PADDING = 64
const GUTTER = 48
const CARD_PAD = 28

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

  const contentWidth = WIDTH - PADDING * 2
  const cardWidth = (contentWidth - GUTTER) / 2
  const nowHeights = rowHeights(ctx, input.now, cardWidth)
  const altHeights = rowHeights(ctx, input.otherwise, cardWidth)
  const block = (heights: [number, number]) => heights[0] + 36 + heights[1]
  const height = PADDING + 78 + 36 + block(nowHeights) + 72 + block(altHeights) + PADDING

  const scale = 2
  canvas.width = WIDTH * scale
  canvas.height = height * scale
  ctx.scale(scale, scale)

  ctx.fillStyle = "#f6f1e7"
  ctx.fillRect(0, 0, WIDTH, height)

  ctx.fillStyle = "#3a322c"
  ctx.font = "600 42px 'Literata Variable', Georgia, serif"
  ctx.fillText("ОЛНО", PADDING, PADDING + 36)

  let y = PADDING + 78
  y = drawHeading(ctx, "Как происходит сейчас", y)
  y = drawLoop(ctx, input.now, y, cardWidth, nowHeights)
  y += 48
  y = drawHeading(ctx, "Как могло бы быть иначе", y)
  drawLoop(ctx, input.otherwise, y, cardWidth, altHeights)

  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = "olno-karta.png"
  link.click()
}

function drawHeading(ctx: CanvasRenderingContext2D, title: string, y: number): number {
  ctx.fillStyle = "#3a322c"
  ctx.font = "600 28px 'Literata Variable', Georgia, serif"
  ctx.fillText(title, PADDING, y + 28)
  return y + 48
}

function rowHeights(
  ctx: CanvasRenderingContext2D,
  nodes: readonly LoopNodeView[],
  cardWidth: number,
): [number, number] {
  ctx.font = "400 22px 'Geist Variable', sans-serif"
  const heightFor = (node: LoopNodeView | undefined) => {
    const lines = wrap(ctx, node?.text ?? "", cardWidth - CARD_PAD * 2)
    const place = node?.placeLabel ? 26 : 0
    return CARD_PAD + 22 + 16 + place + lines.length * 30 + CARD_PAD
  }
  const find = (id: LoopNodeView["id"]) => nodes.find((node) => node.id === id)
  return [
    Math.max(heightFor(find("situation")), heightFor(find("inside"))),
    Math.max(heightFor(find("action")), heightFor(find("consequence"))),
  ]
}

function drawLoop(
  ctx: CanvasRenderingContext2D,
  nodes: readonly LoopNodeView[],
  top: number,
  cardWidth: number,
  heights: [number, number],
): number {
  const left = PADDING
  const right = PADDING + cardWidth + GUTTER
  const bottom = top + heights[0] + 36
  const find = (id: LoopNodeView["id"]) => nodes.find((node) => node.id === id)

  drawCard(ctx, find("situation"), left, top, cardWidth, heights[0])
  drawCard(ctx, find("inside"), right, top, cardWidth, heights[0])
  drawCard(ctx, find("consequence"), left, bottom, cardWidth, heights[1])
  drawCard(ctx, find("action"), right, bottom, cardWidth, heights[1])

  ctx.strokeStyle = "#a56a45"
  ctx.fillStyle = "#a56a45"
  ctx.lineWidth = 1.5
  arrow(ctx, left + cardWidth + 8, top + heights[0] / 2, right - 8, top + heights[0] / 2)
  arrow(ctx, right + cardWidth / 2, top + heights[0] + 8, right + cardWidth / 2, bottom - 8)
  arrow(ctx, right - 8, bottom + heights[1] / 2, left + cardWidth + 8, bottom + heights[1] / 2)
  arrow(ctx, left + cardWidth / 2, bottom - 8, left + cardWidth / 2, top + heights[0] + 8)

  return bottom + heights[1]
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  node: LoopNodeView | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (!node) return
  roundRect(ctx, x, y, width, height, 18)
  ctx.fillStyle = "#fffcf8"
  ctx.fill()
  ctx.strokeStyle = node.placeLabel ? "#a56a45" : "#e4d9cc"
  ctx.lineWidth = node.placeLabel ? 2 : 1
  ctx.stroke()

  ctx.fillStyle = "#7a7068"
  ctx.font = "500 14px 'Geist Variable', sans-serif"
  ctx.fillText(node.title.toUpperCase(), x + CARD_PAD, y + CARD_PAD + 8)

  let textTop = y + CARD_PAD + 36
  if (node.placeLabel) {
    ctx.fillStyle = "#a56a45"
    ctx.font = "500 16px 'Geist Variable', sans-serif"
    ctx.fillText(node.placeLabel, x + CARD_PAD, textTop)
    textTop += 26
  }

  ctx.fillStyle = "#3a322c"
  ctx.font = "400 22px 'Geist Variable', sans-serif"
  const lines = wrap(ctx, node.text, width - CARD_PAD * 2)
  lines.forEach((line, index) => {
    ctx.fillText(line, x + CARD_PAD, textTop + index * 30)
  })
}

function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const size = 8
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - size * Math.cos(angle - 0.45), y2 - size * Math.sin(angle - 0.45))
  ctx.lineTo(x2 - size * Math.cos(angle + 0.45), y2 - size * Math.sin(angle + 0.45))
  ctx.closePath()
  ctx.fill()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.length > 0 ? lines : [""]
}
