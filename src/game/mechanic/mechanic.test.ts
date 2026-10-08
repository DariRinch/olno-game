import { describe, expect, it, vi } from "vitest"
import { SPEC_VERSION } from "./cards"
import { remember, sendEvents, toPayload, type AnalyticEvent } from "./analytics"
import {
  beginNextMove,
  couldCards,
  createRun,
  type Run,
  goBack,
  loadRun,
  openCompare,
  openFork,
  chooseAlternative,
  chooseFork,
  openRoute,
  openSituation,
  submitAct,
  submitAnswer,
  submitContinuation,
  submitHappened,
  submitSituation,
  submitTry,
} from "./flow"
import { answerDistribution, cardFrequency, changedAfterDisambiguationRate, stepTimes } from "./queries"
import { applyAnswer, changedAfterDisambiguation, emptyFacts, resolveMove, showRecognition, type MoveFacts } from "./resolve"
import { tagTransition } from "./transition"

const SECRET = "секретная ситуация про Ивана и счёт 4021"
const OPTION_A = "купить квартиру на Патриарших"
const OPTION_B = "снять комнату у тёти"

function facts(partial: Partial<MoveFacts>): MoveFacts {
  return { ...emptyFacts(), ...partial }
}

describe("eight cards", () => {
  it("does not read the open answer", () => {
    const asked = resolveMove(emptyFacts())
    expect(asked.status).toBe("ask")
    expect(asked.status === "ask" && asked.pair).toBe("contact-started")
    const same = resolveMove(facts({}))
    expect(same).toEqual(asked)
  })

  it("Отношения: waits for an answer", () => {
    const result = resolveMove(facts({
      substantialContact: false,
      startedThenStopped: false,
      waitingForSomething: true,
      waitingObject: "ответ",
      continuedHabitual: false,
    }))
    expect(result).toEqual({ status: "card", card: "waiting" })
  })

  it("Отношения: starts the conversation and stops", () => {
    expect(resolveMove(facts({ substantialContact: true, startedThenStopped: true }))).toEqual({
      status: "card",
      card: "flight",
    })
  })

  it("Отношения: changes how they communicate", () => {
    expect(resolveMove(facts({ changed: "own-way" }))).toEqual({ status: "card", card: "adaptation" })
  })

  it("Деньги: less than expected is not yet a card", () => {
    const result = resolveMove(emptyFacts())
    expect(result.status).toBe("ask")
    if (result.status === "ask") expect(result.pair).toBe("contact-started")
  })

  it("Деньги: waits for money to arrive", () => {
    expect(resolveMove(facts({
      substantialContact: false,
      waitingForSomething: true,
      waitingObject: "деньги",
      continuedHabitual: false,
    }))).toEqual({ status: "card", card: "waiting" })
  })

  it("Деньги: starts counting expenses and stops", () => {
    expect(resolveMove(facts({ startedThenStopped: true }))).toEqual({ status: "card", card: "flight" })
  })

  it("Деньги: sets a limit", () => {
    expect(resolveMove(facts({ changed: "conditions" }))).toEqual({ status: "card", card: "control" })
  })

  it("Деньги: speeds up a payment", () => {
    expect(resolveMove(facts({ tempoOrPredictable: "tempo" }))).toEqual({ status: "card", card: "acceleration" })
  })

  it("Деньги: two named financial options and no choice", () => {
    expect(resolveMove(facts({
      substantialContact: false,
      waitingForSomething: false,
      namedOptionCount: 2,
    }))).toEqual({ status: "card", card: "doubt" })
  })

  it("does not assign Сомнение when two options are not named", () => {
    const result = resolveMove(facts({
      substantialContact: false,
      waitingForSomething: false,
      namedOptionCount: 1,
      continuedHabitual: null,
    }))
    expect(result.status).not.toBe("card")
    if (result.status === "ask") expect(result.pair).not.toBe("avoidance-doubt")
    expect(result.status === "card" && result.card).not.toBe("doubt")
  })

  it("Работа: edits after the work is finished are not a card", () => {
    expect(resolveMove(emptyFacts()).status).toBe("ask")
  })

  it("Работа: keeps the old way", () => {
    expect(resolveMove(facts({ continuedHabitual: true }))).toEqual({ status: "card", card: "holding" })
  })

  it("Работа: changes their own way of working", () => {
    expect(resolveMove(facts({ changed: "own-way" }))).toEqual({ status: "card", card: "adaptation" })
  })

  it("Работа: adds rules or checks", () => {
    expect(resolveMove(facts({ changed: "conditions" }))).toEqual({ status: "card", card: "control" })
  })

  it("Работа: tries to speed the result", () => {
    expect(resolveMove(facts({ tempoOrPredictable: "tempo" }))).toEqual({ status: "card", card: "acceleration" })
  })

  it("Работа: avoids the conversation", () => {
    expect(resolveMove(facts({
      substantialContact: false,
      startedThenStopped: false,
      waitingForSomething: false,
      continuedHabitual: false,
      namedOptionCount: 0,
    }))).toEqual({ status: "card", card: "avoidance" })
  })

  it("Работа: starts the conversation and leaves it", () => {
    expect(resolveMove(facts({ substantialContact: true, startedThenStopped: true }))).toEqual({
      status: "card",
      card: "flight",
    })
  })

  it("asks Ожидание vs Избегание when contact has not happened", () => {
    const result = resolveMove(facts({ substantialContact: false, startedThenStopped: false }))
    expect(result).toMatchObject({ status: "ask", pair: "waiting-avoidance" })
  })

  it("asks Избегание vs Бегство after contact has started", () => {
    const result = resolveMove(facts({ substantialContact: true }))
    expect(result).toMatchObject({ status: "ask", pair: "avoidance-flight" })
  })

  it("asks what was main when two mechanisms are present", () => {
    const result = resolveMove(facts({ changed: "own-way", tempoOrPredictable: "tempo" }))
    expect(result.status).toBe("ask")
    if (result.status !== "ask") return
    expect(result.pair).toBe("both-main")
    expect(result.question).toBe("Что было главным?")
    expect(result.choices.map((choice) => choice.id).sort()).toEqual(["acceleration", "adaptation"])
  })

  it("waiting without an object stays unresolved", () => {
    expect(resolveMove(facts({
      substantialContact: false,
      waitingForSomething: true,
      waitingObject: "",
    }))).toEqual({ status: "unresolved", reason: "waiting-without-object" })
  })

  it("a later answer that changes the card marks changed_after_disambiguation", () => {
    const log = [
      { pair: "control-adaptation" as const, answer: "own-way" },
      { pair: "control-adaptation" as const, answer: "conditions" },
    ]
    expect(changedAfterDisambiguation(log)).toBe(true)
    const kept = [{ pair: "contact-started" as const, answer: "no" }, { pair: "waiting-avoidance" as const, answer: "no" }]
    expect(changedAfterDisambiguation(kept)).toBe(false)
  })

  it("shows recognition on odd steps only, and never without a card", () => {
    expect(showRecognition(1, "holding")).toBe(true)
    expect(showRecognition(2, "acceleration")).toBe(false)
    expect(showRecognition(3, null)).toBe(false)
  })
})

describe("transitions", () => {
  it("tags a continued contact as DIRECT", () => {
    expect(tagTransition("holding", "acceleration", "same")).toBe("DIRECT")
  })

  it("does not treat Бегство as the end", () => {
    expect(tagTransition("flight", "adaptation", "new-event")).toBe("CONDITIONAL")
    expect(tagTransition("flight", "waiting", "new-entry")).toBe("REENTRY")
    expect(tagTransition("flight", "holding", "same")).toBe("INVALID")
    expect(tagTransition("flight", "holding", null)).toBe("INVALID")
  })

  it("marks avoidance inside an already started contact as INVALID", () => {
    expect(tagTransition("control", "avoidance", "same")).toBe("INVALID")
    expect(tagTransition("control", "avoidance", "new-entry")).toBe("REENTRY")
  })
})

describe("second circle", () => {
  it("keeps the first route and swaps one move in the other", () => {
    let run = openSituation(createRun("11111111-1111-4111-8111-111111111111"))
    run = must(submitSituation(run, "Партнёр снова отменил встречу", "own", null))
    run = must(submitAct(run, "Жду, когда он напишет"))
    run = submitAnswer(run, { pair: "contact-started", answer: "no" })
    run = submitAnswer(run, { pair: "waiting-avoidance", answer: "yes" })
    run = submitAnswer(run, { pair: "waiting-object", answer: "ответ", waitingObject: "ответ" })
    run = submitAnswer(run, { pair: "waiting-holding", answer: "no" })
    expect(run.moves[0]?.card).toBe("waiting")
    expect(run.moves[0]?.actText).toBe("Жду, когда он напишет")
    run = { ...run, screen: "happened" }
    run = must(submitHappened(run, "Встречи снова нет"))
    run = beginNextMove(run)
    run = must(submitAct(run, "Пишу первой и короче, чем раньше"))
    run = submitAnswer(run, { pair: "contact-started", answer: "yes" })
    run = submitAnswer(run, { pair: "avoidance-flight", answer: "no" })
    run = submitAnswer(run, { pair: "waiting-holding", answer: "no" })
    run = submitAnswer(run, { pair: "acceleration-control", answer: "neither" })
    run = submitAnswer(run, { pair: "control-adaptation", answer: "own-way" })
    expect(run.moves[1]?.card).toBe("adaptation")
    run = { ...run, screen: "happened" }
    run = must(submitHappened(run, "Он отвечает в тот же день"))
    run = openRoute(run)
    run = openFork(run)
    run = chooseFork(run, 0)
    run = must(chooseAlternative(run, "holding"))
    expect(run.alternativeCard).toBe("holding")
    const could = couldCards(run)
    expect(run.moves.map((move) => move.card)).toEqual(["waiting", "adaptation"])
    expect(could).toEqual(["holding", "adaptation"])
    run = openCompare(run)
    run = must(submitTry(run, "Написать одно предложение и остановиться"))
    expect(run.screen).toBe("result")
    expect(run.tryAction).toBe("Написать одно предложение и остановиться")
    const back = goBack(run)
    expect(back.tryAction).toBe(run.tryAction)
    expect(back.screen).toBe("compare")
  })

  it("keeps a move after Бегство and tags the link", () => {
    let run = openSituation(createRun("22222222-2222-4222-8222-222222222222"))
    run = must(submitSituation(run, "Разговор о задаче", "card", "work"))
    run = must(submitAct(run, "Начала разговор и вышла из него"))
    run = submitAnswer(run, { pair: "contact-started", answer: "yes" })
    run = submitAnswer(run, { pair: "avoidance-flight", answer: "yes" })
    expect(run.moves[0]?.card).toBe("flight")
    run = { ...run, screen: "happened" }
    run = must(submitHappened(run, "Тема оборвалась"))
    run = beginNextMove(run)
    expect(run.screen).toBe("link")
    run = submitContinuation(run, "new-event")
    run = must(submitAct(run, "После его письма написала снова"))
    run = submitAnswer(run, { pair: "contact-started", answer: "no" })
    run = submitAnswer(run, { pair: "waiting-avoidance", answer: "yes" })
    run = submitAnswer(run, { pair: "waiting-object", answer: "письмо", waitingObject: "письмо" })
    run = submitAnswer(run, { pair: "waiting-holding", answer: "no" })
    expect(run.moves[1]?.card).toBe("waiting")
    expect(run.moves[1]?.transition).toBe("CONDITIONAL")
    expect(run.moves).toHaveLength(2)
  })
})

function must(value: Run | "empty" | "same"): Run {
  if (value === "empty" || value === "same") throw new Error(value)
  return value
}

describe("analytics payload", () => {
  it("drops situation text, free answers, option text, and the try-action", async () => {
    const dirty = {
      session_id: "33333333-3333-4333-8333-333333333333",
      spec_version: SPEC_VERSION,
      source: "own",
      theme: "money",
      contact: "none",
      move: "waiting",
      pair_shown: "waiting-object",
      pair_answer: SECRET,
      card: "waiting",
      recognition: "yes",
      step_time: 1200,
      step_number: 1,
      dropoff_step: "card",
      changed_after_disambiguation: false,
      situationText: SECRET,
      actText: "жду перевод",
      happenedText: "денег нет",
      tryAction: "отложить одну покупку",
      waitingObject: "зарплата",
      optionTexts: [OPTION_A, OPTION_B],
      email: "person@example.com",
    }
    const clean = toPayload(dirty)
    const serialized = JSON.stringify(clean)
    expect(serialized).not.toContain(SECRET)
    expect(serialized).not.toContain(OPTION_A)
    expect(serialized).not.toContain(OPTION_B)
    expect(serialized).not.toContain("зарплата")
    expect(serialized).not.toContain("жду перевод")
    expect(serialized).not.toContain("person@example.com")
    expect(clean.pair_answer).toBeNull()
    expect(Object.keys(clean).sort()).toEqual([
      "card",
      "changed_after_disambiguation",
      "contact",
      "dropoff_step",
      "move",
      "pair_answer",
      "pair_shown",
      "recognition",
      "session_id",
      "source",
      "spec_version",
      "step_number",
      "step_time",
      "theme",
    ])

    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => new Response("ok"))
    const held = await sendEvents([dirty], undefined, fetchImpl)
    expect(held).toEqual({ sent: false })
    expect(fetchImpl).not.toHaveBeenCalled()

    const sent = await sendEvents([dirty], "https://example.test/events", fetchImpl)
    expect(sent).toEqual({ sent: true, count: 1 })
    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body ?? ""))
    expect(JSON.stringify(body)).not.toContain(SECRET)
    expect(JSON.stringify(body)).not.toContain(OPTION_A)
  })

  it("stores only the cleaned event", () => {
    const memory = new Map<string, string>()
    const store = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
    }
    remember({ situationText: SECRET, pair_answer: OPTION_A, card: "flight", spec_version: SPEC_VERSION }, store)
    const raw = [...memory.values()].join("\n")
    expect(raw).not.toContain(SECRET)
    expect(raw).not.toContain(OPTION_A)
  })

  it("rejects the old four-node save", () => {
    const old = JSON.stringify({
      version: 2,
      screen: "node",
      situationText: SECRET,
      nodes: { situation: { text: SECRET, source: "own" } },
    })
    const run = loadRun(old)
    expect(run.version).toBe(3)
    expect(run.screen).toBe("home")
    expect(run.situationText).not.toBe(SECRET)
  })

  it("returns n beside a percent and does not add a conclusion", () => {
    const events: AnalyticEvent[] = [
      payload({ card: "holding", move: "holding", pair_shown: "waiting-holding", pair_answer: "yes", step_number: 1, step_time: 10, recognition: "yes" }),
      payload({ card: "holding", move: "holding", step_number: 1, step_time: 30, recognition: "no", changed_after_disambiguation: true }),
      payload({ card: "flight", move: "flight", step_number: 2, step_time: 20 }),
    ]
    const cards = cardFrequency(events)
    expect(cards[0]).toMatchObject({ key: "holding", n: 2, percent: 66.7 })
    expect(JSON.stringify(cards)).not.toMatch(/significant|вывод|диагноз/i)
    const answers = answerDistribution(events)
    expect(answers[0]).toMatchObject({ key: "waiting-holding:yes", n: 1 })
    expect(answers[0]?.percent).toBeTypeOf("number")
    const changed = changedAfterDisambiguationRate(events)
    expect(changed.n).toBe(1)
    expect(changed.percent).toBeTypeOf("number")
    const times = stepTimes(events)
    expect(times[0]).toMatchObject({ step: "1", n: 2 })
    expect(times[0]?.median).toBe(20)
  })
})

function payload(partial: Partial<AnalyticEvent>): AnalyticEvent {
  return toPayload({
    session_id: "44444444-4444-4444-8444-444444444444",
    spec_version: SPEC_VERSION,
    ...partial,
  })
}

describe("closed answers do not guess", () => {
  it("ignores an unknown answer", () => {
    const next = applyAnswer(emptyFacts(), { pair: "contact-started", answer: "maybe they waited" })
    expect(next).toEqual(emptyFacts())
    expect(resolveMove(next).status).toBe("ask")
  })
})
