import { useEffect, useRef, useState } from "react"
import { HomeScreen } from "@/components/screens/HomeScreen"
import { EightFlow } from "@/components/screens/EightFlow"
import { Shell } from "@/components/Shell"
import { remember } from "@/game/mechanic/analytics"
import { SPEC_VERSION } from "@/game/mechanic/cards"
import {
  STORAGE_KEY,
  contactCode,
  goBack,
  loadRun,
  openSituation,
  saveRun,
  type Run,
} from "@/game/mechanic/flow"

export default function App() {
  const [run, setRun] = useState<Run>(() => loadRun(localStorage.getItem(STORAGE_KEY)))
  const entered = useRef(0)

  useEffect(() => {
    entered.current = Date.now()
  }, [])

  useEffect(() => {
    saveRun(run, localStorage)
  }, [run])

  useEffect(() => {
    const onHide = () => {
      const move = run.moves[run.editing]
      remember({
        session_id: run.sessionId,
        spec_version: SPEC_VERSION,
        source: run.situationSource,
        theme: run.themeId,
        contact: contactCode(move ?? null),
        card: move?.card ?? null,
        move: move?.card ?? (run.moves.length > 0 ? "unresolved" : null),
        changed_after_disambiguation: move?.changedAfterDisambiguation === true,
        step_number: run.moves.length || null,
        step_time: Date.now() - entered.current,
        dropoff_step: run.screen,
      }, localStorage)
    }
    window.addEventListener("pagehide", onHide)
    return () => window.removeEventListener("pagehide", onHide)
  }, [run])

  function commit(next: Run) {
    const move = next.moves[next.editing]
    const last = move?.log.at(-1)
    remember({
      session_id: next.sessionId,
      spec_version: SPEC_VERSION,
      source: next.situationSource,
      theme: next.themeId,
      contact: contactCode(move ?? null),
      card: move?.card ?? null,
      move: move?.card ?? (next.moves.length > 0 ? "unresolved" : null),
      pair_shown: last?.pair ?? null,
      pair_answer: last?.answer ?? null,
      recognition: move?.recognition ?? null,
      changed_after_disambiguation: move?.changedAfterDisambiguation === true,
      step_number: next.moves.length || null,
      step_time: Date.now() - entered.current,
    }, localStorage)
    entered.current = Date.now()
    setRun(next)
  }

  const wide = run.screen === "home" || run.screen === "route" || run.screen === "fork" || run.screen === "compare" || run.screen === "result"

  return (
    <Shell
      screen={run.screen}
      width={wide ? "wide" : "prose"}
      onBack={run.screen === "home" ? undefined : () => commit(goBack(run))}
    >
      {run.screen === "home" ? (
        <HomeScreen onStart={() => commit(openSituation(run))} />
      ) : (
        <EightFlow run={run} onChange={commit} />
      )}
    </Shell>
  )
}
