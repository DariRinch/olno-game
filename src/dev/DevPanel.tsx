import { alternativePhrases, nodeMeta, nodePhrases, places } from "@/game/cards"
import {
  changedNodeId,
  loopTexts,
  openSituation,
  startNewGame,
  submitAlternative,
  submitNode,
  submitSituation,
} from "@/game/gameEngine"
import { currentNodeId, nodeTitle } from "@/game/state"
import { NODE_IDS, type GameState, type NodeId, type PlaceId } from "@/game/types"
import { Button } from "@/components/ui/button"

const PRESET_SITUATION =
  "Я делаю важный для меня проект, но человек, от которого зависит оплата, постоянно откладывает решение"

const PANEL_SCREENS = new Set<GameState["screen"]>([
  "home",
  "situation",
  "node",
  "loop",
  "alternative",
  "second-map",
])

type DevPanelProps = {
  state: GameState
  onChange: (next: GameState) => void
}

export function DevPanel({ state, onChange }: DevPanelProps) {
  if (!PANEL_SCREENS.has(state.screen)) return null

  const now = loopTexts(state, "now")
  const otherwise = loopTexts(state, "otherwise")
  const place = places.find((item) => item.id === state.chosenPlace) ?? null
  const diffs =
    now && otherwise ? NODE_IDS.filter((id) => now[id] !== otherwise[id]) : null
  const nodeId = state.screen === "node" ? currentNodeId(state) : null
  const nodeDeck = nodeId && nodeId !== "situation" ? nodePhrases[nodeId] : null

  function startPreset() {
    const opened = openSituation(startNewGame())
    const result = submitSituation(opened, PRESET_SITUATION, "own")
    if (result !== "empty") onChange(result)
  }

  function applyNodeCard(id: NodeId, text: string) {
    const result = submitNode(state, id, text, "card")
    if (result !== "empty" && result !== state) onChange(result)
  }

  function applyAlternative(id: PlaceId, text: string) {
    const result = submitAlternative(state, id, text, "card")
    if (result !== "empty" && result !== state) onChange(result)
  }

  return (
    <aside
      data-dev-panel="1"
      className="mt-10 rounded-lg border border-dashed border-border px-3 py-3 text-xs leading-relaxed text-muted-foreground"
    >
      <p className="font-medium tracking-wide text-foreground">DEV · не часть игры</p>
      <p className="mt-1">
        Только сборка разработки и адрес с ?dev=1. В обычном заходе этой панели нет.
      </p>

      {state.screen === "home" || state.screen === "situation" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-8 bg-card"
          onClick={startPreset}
        >
          Подставить заданную ситуацию
        </Button>
      ) : null}

      <ul className="mt-4 grid gap-3">
        {NODE_IDS.map((id) => {
          const node = state.nodes[id]
          const source =
            node?.source === "card" ? "карточка" : node?.source === "own" ? "свои слова" : "нет"
          return (
            <li key={id} className="border-t border-dashed border-border pt-3">
              <p className="text-foreground">{nodeMeta[id].title}</p>
              <p>полный текст: {node?.text || "нет"}</p>
              <p>тип узла: {nodeMeta[id].title}</p>
              <p>карточка или свои слова: {source}</p>
              <p>исходный текст: {now?.[id] || "нет"}</p>
              <p>изменённый текст: {otherwise?.[id] || "нет"}</p>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 border-t border-dashed border-border pt-3">
        какое место заменяется:{" "}
        {place ? `${place.label}, узел ${nodeTitle(changedNodeId(place.id))}` : "не выбрано"}
      </p>
      <p className="mt-2" data-dev-diff={diffs ? String(diffs.length) : ""}>
        {diffSentence(diffs)}
      </p>

      {nodeDeck && nodeId ? (
        <PhraseList
          title="Карточки этого узла"
          phrases={nodeDeck}
          onPick={(text) => applyNodeCard(nodeId, text)}
        />
      ) : null}

      {state.screen === "alternative" ? (
        <div className="mt-4 grid gap-3">
          {places.map((item) => (
            <PhraseList
              key={item.id}
              title={item.label}
              phrases={alternativePhrases[item.id]}
              onPick={(text) => applyAlternative(item.id, text)}
            />
          ))}
        </div>
      ) : null}
    </aside>
  )
}

function PhraseList({
  title,
  phrases,
  onPick,
}: {
  title: string
  phrases: readonly { id: string; text: string }[]
  onPick: (text: string) => void
}) {
  return (
    <div className="mt-3">
      <p className="text-foreground">{title}</p>
      <div className="mt-2 grid gap-1.5">
        {phrases.map((phrase) => (
          <Button
            key={phrase.id}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto min-h-7 justify-start bg-card px-2 py-1.5 text-left text-xs whitespace-normal"
            onClick={() => onPick(phrase.text)}
          >
            {phrase.text}
          </Button>
        ))}
      </div>
    </div>
  )
}

function diffSentence(diffs: NodeId[] | null): string {
  if (!diffs) return "Вторая петля ещё не собрана."
  if (diffs.length === 1) return `Отличается ровно один узел: ${nodeTitle(diffs[0])}.`
  if (diffs.length === 0) return "Сбой: ни один узел не отличается."
  return `Сбой: отличается больше одного узла: ${diffs.map((id) => nodeTitle(id)).join(", ")}.`
}
