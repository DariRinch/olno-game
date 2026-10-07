import { useEffect, useState } from "react"
import { AlternativeScreen } from "@/components/screens/AlternativeScreen"
import { ConsultScreen } from "@/components/screens/ConsultScreen"
import { HomeScreen } from "@/components/screens/HomeScreen"
import { LoopScreen } from "@/components/screens/LoopScreen"
import { NodeScreen } from "@/components/screens/NodeScreen"
import { SecondMapScreen } from "@/components/screens/SecondMapScreen"
import { SituationScreen } from "@/components/screens/SituationScreen"
import { Shell } from "@/components/Shell"
import { DevGate } from "@/dev/DevGate"
import { nodeMeta, nodePhrases, places } from "@/game/cards"
import {
  changedNodeId,
  loopTexts,
  openAlternative,
  openConsult,
  openSituation,
  returnToMap,
  startNewGame,
  submitAlternative,
  submitNode,
  submitSituation,
} from "@/game/gameEngine"
import { currentNodeId, loadRun, nodeTitle, saveRun } from "@/game/state"
import { NODE_IDS, type GameState, type NodeId } from "@/game/types"
import type { LoopNodeView } from "@/components/LoopMap"

function toViews(texts: Record<NodeId, string>, mark?: { id: NodeId; placeLabel: string }): LoopNodeView[] {
  return NODE_IDS.map((id) => ({
    id,
    title: nodeTitle(id),
    text: texts[id],
    placeLabel: mark && mark.id === id ? mark.placeLabel : undefined,
  }))
}

export default function App() {
  const [state, setState] = useState<GameState>(() => loadRun())

  useEffect(() => {
    saveRun(state)
  }, [state])

  const nodeId = currentNodeId(state)
  const wide = state.screen === "home" || state.screen === "loop" || state.screen === "second-map"
  const nowTexts = loopTexts(state, "now")
  const altTexts = loopTexts(state, "otherwise")
  const placeLabel = places.find((place) => place.id === state.chosenPlace)?.label
  const mark =
    state.chosenPlace && placeLabel
      ? { id: changedNodeId(state.chosenPlace), placeLabel }
      : undefined

  return (
    <Shell screen={state.screen} width={wide ? "wide" : "prose"}>
      {state.screen === "home" ? (
        <HomeScreen onStart={() => setState((current) => openSituation(current))} />
      ) : null}

      {state.screen === "situation" ? (
        <SituationScreen
          onSubmit={(text, source) => {
            const result = submitSituation(state, text, source)
            if (result === "empty") return "empty"
            setState(result)
          }}
        />
      ) : null}

      {state.screen === "node" && nodeId ? (
        <NodeScreen
          key={nodeId}
          index={NODE_IDS.indexOf(nodeId) + 1}
          total={NODE_IDS.length}
          title={nodeMeta[nodeId].title}
          question={nodeMeta[nodeId].question}
          phrases={nodeId === "situation" ? undefined : nodePhrases[nodeId]}
          keptText={nodeId === "situation" ? state.situationText : undefined}
          keepSource={state.situationSource ?? "own"}
          onCommit={(text, source) => {
            const result = submitNode(state, nodeId, text, source)
            if (result === "empty") return "empty"
            setState(result)
          }}
        />
      ) : null}

      {state.screen === "loop" && nowTexts ? (
        <LoopScreen nodes={toViews(nowTexts)} onContinue={() => setState((current) => openAlternative(current))} />
      ) : null}

      {state.screen === "alternative" ? (
        <AlternativeScreen
          onSubmit={(place, text, source) => {
            const result = submitAlternative(state, place, text, source)
            if (result === "empty") return "empty"
            setState(result)
          }}
        />
      ) : null}

      {state.screen === "second-map" && nowTexts && altTexts && mark ? (
        <SecondMapScreen
          now={toViews(nowTexts)}
          otherwise={toViews(altTexts, mark)}
          onRestart={() => setState(startNewGame())}
          onConsult={() => setState((current) => openConsult(current))}
        />
      ) : null}

      {state.screen === "consult" ? (
        <ConsultScreen
          situationText={state.situationText}
          onBack={() => setState((current) => returnToMap(current))}
        />
      ) : null}

      {import.meta.env.DEV ? <DevGate state={state} onChange={setState} /> : null}
    </Shell>
  )
}
