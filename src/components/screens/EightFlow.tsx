import { useState, type FormEvent } from "react"
import { SituationScreen } from "@/components/screens/SituationScreen"
import { ChoiceNode } from "@/components/ChoiceNode"
import { Wordmark } from "@/components/Wordmark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { situationThemes } from "@/game/cards"
import { CARD_IDS, CARD_NAME } from "@/game/mechanic/cards"
import {
  beginNextMove,
  createRun,
  chooseAlternative,
  chooseFork,
  clarifyAt,
  continueFromCard,
  couldCards,
  moveTitle,
  openCompare,
  openFork,
  openRoute,
  recognitionDue,
  reopenClarification,
  submitAct,
  submitAnswer,
  submitContinuation,
  submitHappened,
  submitRecognition,
  submitSituation,
  submitTry,
  type Run,
} from "@/game/mechanic/flow"
import { resolveMove } from "@/game/mechanic/resolve"

type FlowProps = {
  run: Run
  onChange: (run: Run) => void
}

const fieldClass = "mt-2 h-12 border-[var(--olno-line)] bg-transparent px-3 text-base md:text-base"

function asRun(value: Run | "empty" | "same"): Run | null {
  return typeof value === "string" ? null : value
}

export function EightFlow({ run, onChange }: FlowProps) {
  switch (run.screen) {
    case "situation":
      return (
        <SituationScreen
          initialText={run.situationText}
          initialSource={run.situationSource}
          onSubmit={(text, source) => {
            const theme = situationThemes.find((item) => item.label === text)
            const next = asRun(submitSituation(run, text, source, theme?.id ?? null))
            if (!next) return "empty"
            onChange(next)
          }}
        />
      )
    case "link":
      return <LinkStep run={run} onChange={onChange} />
    case "act":
      return <ActStep run={run} onChange={onChange} />
    case "clarify":
      return <ClarifyStep run={run} onChange={onChange} />
    case "card":
      return <CardStep run={run} onChange={onChange} />
    case "happened":
      return <HappenedStep run={run} onChange={onChange} />
    case "route":
      return <RouteStep run={run} onChange={onChange} />
    case "fork":
      return <ForkStep run={run} onChange={onChange} />
    case "compare":
      return <CompareStep run={run} onChange={onChange} />
    case "result":
      return <ResultStep run={run} onRestart={() => onChange(createRun())} />
    default:
      return null
  }
}

function ActStep({ run, onChange }: FlowProps) {
  const move = run.moves[run.editing]
  const [words, setWords] = useState(move?.actText ?? "")
  const [error, setError] = useState("")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = asRun(submitAct(run, words))
    if (!next) {
      setError("Напиши, что ты сделал(а).")
      return
    }
    onChange(next)
  }

  return (
    <form className="my-auto flex w-full max-w-xl flex-col" onSubmit={handleSubmit} noValidate>
      <Wordmark />
      <p className="mt-5 text-sm text-[var(--olno-burgundy-soft)]">Ход {run.editing + 1}</p>
      <h1 className="mt-2 max-w-md font-display text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-4xl">
        Что я сделал(а)?
      </h1>
      <Label htmlFor="act-words" className="mt-6 text-base">
        Своими словами, про этот раз
      </Label>
      <Input
        id="act-words"
        value={words}
        maxLength={280}
        aria-invalid={Boolean(error)}
        className={fieldClass}
        onChange={(event) => {
          setWords(event.target.value)
          if (error) setError("")
        }}
      />
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" size="lg" className="mt-6 h-12 w-full text-base sm:w-auto sm:min-w-52">
        Дальше
      </Button>
    </form>
  )
}

function LinkStep({ run, onChange }: FlowProps) {
  return (
    <div className="my-auto flex w-full max-w-xl flex-col">
      <Wordmark />
      <p className="mt-5 text-sm text-[var(--olno-burgundy-soft)]">Следующий ход</p>
      <h1 className="mt-2 max-w-md font-display text-3xl leading-tight font-semibold tracking-[-0.03em]">
        Это после чего?
      </h1>
      <div className="mt-6 grid gap-1">
        <ChoiceNode onClick={() => onChange(submitContinuation(run, "new-event"))}>После нового события</ChoiceNode>
        <ChoiceNode onClick={() => onChange(submitContinuation(run, "new-entry"))}>После нового контакта</ChoiceNode>
        <ChoiceNode onClick={() => onChange(submitContinuation(run, "same"))}>Это всё ещё тот же контакт</ChoiceNode>
      </div>
    </div>
  )
}

function ClarifyStep({ run, onChange }: FlowProps) {
  const move = run.moves[run.editing]
  const resolution = move ? resolveMove(move.facts) : { status: "unresolved" as const, reason: "no-card" as const }
  const [objectName, setObjectName] = useState("")
  const [firstOption, setFirstOption] = useState("")
  const [secondOption, setSecondOption] = useState("")
  const [error, setError] = useState("")

  if (!move || resolution.status !== "ask") {
    return (
      <div className="my-auto flex w-full max-w-xl flex-col">
        <Wordmark />
        <h1 className="mt-5 font-display text-3xl font-semibold">Пока неясно</h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
          По тому, что уже сказано, карту не поставить.
        </p>
        <Button type="button" variant="ghost" className="mt-6 h-12 w-fit px-0 text-base" onClick={() => onChange(reopenClarification(run))}>
          Уточнить
        </Button>
      </div>
    )
  }

  function answer(id: string, optionTexts?: string[], optionCount?: number, waitingObject?: string) {
    onChange(submitAnswer(run, {
      pair: resolution.status === "ask" ? resolution.pair : "contact-started",
      answer: id,
      optionCount,
      waitingObject,
    }, optionTexts))
  }

  return (
    <form
      className="my-auto flex w-full max-w-xl flex-col"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (resolution.field === "waiting-object") {
          const named = objectName.trim()
          if (!named) {
            setError("Без предмета ожидания это ещё не карта.")
            answer("no", undefined, undefined, "")
            return
          }
          answer("yes", undefined, undefined, named)
          return
        }
        if (resolution.field === "two-options") {
          const options = [firstOption.trim(), secondOption.trim()].filter(Boolean)
          if (options.length < 2) {
            setError("Нужны два названных варианта, иначе это не Сомнение.")
            return
          }
          answer("two-named", options, options.length)
        }
      }}
    >
      <Wordmark />
      <p className="mt-5 text-sm text-[var(--olno-burgundy-soft)]">Уточнение</p>
      <h1 className="mt-2 max-w-md font-display text-3xl leading-tight font-semibold tracking-[-0.03em]">
        {resolution.question}
      </h1>
      {resolution.field === "waiting-object" ? (
        <Input
          value={objectName}
          maxLength={280}
          aria-label="Чего именно ты ждёшь"
          className={fieldClass}
          onChange={(event) => setObjectName(event.target.value)}
        />
      ) : null}
      {resolution.field === "two-options" ? (
        <div className="mt-6 grid gap-3">
          <Input value={firstOption} maxLength={280} aria-label="Первый вариант" className={fieldClass} onChange={(event) => setFirstOption(event.target.value)} />
          <Input value={secondOption} maxLength={280} aria-label="Второй вариант" className={fieldClass} onChange={(event) => setSecondOption(event.target.value)} />
        </div>
      ) : null}
      {error ? <Alert>{error}</Alert> : null}
      {resolution.field ? (
        <Button type="submit" size="lg" className="mt-6 h-12 w-full text-base sm:w-auto sm:min-w-52">
          Дальше
        </Button>
      ) : (
        <div className="mt-6 grid gap-1">
          {resolution.choices.map((choice) => (
            <ChoiceNode key={choice.id} onClick={() => answer(choice.id)}>{choice.label}</ChoiceNode>
          ))}
        </div>
      )}
      {resolution.field === "two-options" ? (
        <Button
          type="button"
          variant="ghost"
          className="mt-3 h-12 w-fit px-0 text-base"
          onClick={() => answer("not-two", [], [firstOption.trim(), secondOption.trim()].filter(Boolean).length)}
        >
          Двух вариантов нет
        </Button>
      ) : null}
    </form>
  )
}

function CardStep({ run, onChange }: FlowProps) {
  const move = run.moves[run.editing]
  const askRecognition = recognitionDue(run)
  if (!move) return null
  return (
    <div className="my-auto flex w-full max-w-xl flex-col">
      <Wordmark />
      <p className="mt-5 text-sm text-[var(--olno-burgundy-soft)]">Карта</p>
      <h1 className="mt-2 font-display text-4xl leading-tight font-semibold tracking-[-0.03em] md:text-5xl">
        {moveTitle(move.card)}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed">{move.actText}</p>
      {move.card === null ? (
        <Button type="button" variant="ghost" className="mt-4 h-12 w-fit px-0 text-base" onClick={() => onChange(reopenClarification(run))}>
          Уточнить
        </Button>
      ) : null}
      {askRecognition ? (
        <div className="mt-8">
          <p className="text-sm text-[var(--olno-burgundy-soft)]">Это про тот ход?</p>
          <div className="mt-2 grid gap-1">
            <ChoiceNode onClick={() => onChange(submitRecognition(run, "yes"))}>Да, это про то, что я делал(а)</ChoiceNode>
            <ChoiceNode onClick={() => onChange(submitRecognition(run, "partial"))}>Частично</ChoiceNode>
            <ChoiceNode onClick={() => onChange(submitRecognition(run, "no"))}>Нет</ChoiceNode>
          </div>
        </div>
      ) : (
        <Button type="button" size="lg" className="mt-6 h-12 w-full text-base sm:w-auto sm:min-w-52" onClick={() => onChange(continueFromCard(run))}>
          Дальше
        </Button>
      )}
    </div>
  )
}

function HappenedStep({ run, onChange }: FlowProps) {
  const move = run.moves[run.editing]
  const [words, setWords] = useState(move?.happenedText ?? "")
  const [error, setError] = useState("")

  function save(): Run | null {
    const next = asRun(submitHappened(run, words))
    if (!next) {
      setError("Напиши, что произошло.")
      return null
    }
    return next
  }

  return (
    <form
      className="my-auto flex w-full max-w-xl flex-col"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const next = save()
        if (next) onChange(openRoute(next))
      }}
    >
      <Wordmark />
      <p className="mt-5 text-sm text-[var(--olno-burgundy-soft)]">После хода</p>
      <h1 className="mt-2 max-w-md font-display text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-4xl">
        Что произошло?
      </h1>
      <Input
        value={words}
        maxLength={280}
        aria-label="Что произошло"
        className={fieldClass}
        onChange={(event) => {
          setWords(event.target.value)
          if (error) setError("")
        }}
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" className="h-12 w-full text-base sm:w-auto sm:min-w-52">
          К маршруту
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 w-full px-0 text-base sm:w-auto"
          onClick={() => {
            const next = save()
            if (next) onChange(beginNextMove(next))
          }}
        >
          Ещё ход
        </Button>
      </div>
    </form>
  )
}

function RouteStep({ run, onChange }: FlowProps) {
  return (
    <div className="my-auto flex w-full max-w-xl flex-col">
      <Wordmark />
      <h1 className="mt-5 font-display text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-4xl">
        Мой маршрут
      </h1>
      <ol className="mt-6 grid gap-5">
        {run.moves.map((move, index) => (
          <li key={index}>
            <p className="text-sm text-[var(--olno-burgundy-soft)]">{moveTitle(move.card)}</p>
            <p className="mt-1 text-base leading-relaxed">{move.actText}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--olno-burgundy-soft)]">{move.happenedText}</p>
            {move.card === null ? (
              <button type="button" className="mt-2 bg-transparent p-0 text-base text-[var(--olno-burgundy-soft)]" onClick={() => onChange(clarifyAt(run, index))}>
                Уточнить
              </button>
            ) : null}
          </li>
        ))}
      </ol>
      <Button type="button" size="lg" className="mt-8 h-12 w-full text-base sm:w-auto sm:min-w-52" onClick={() => onChange(openFork(run))}>
        Здесь мог быть другой ход
      </Button>
    </div>
  )
}

function ForkStep({ run, onChange }: FlowProps) {
  const index = run.forkIndex ?? 0
  const marked = run.moves[index]
  const next = run.moves[index + 1]
  const [error, setError] = useState("")
  return (
    <div className="my-auto flex w-full max-w-xl flex-col">
      <Wordmark />
      <h1 className="mt-5 max-w-md font-display text-3xl leading-tight font-semibold tracking-[-0.03em]">
        Что могло бы быть иначе здесь?
      </h1>
      <p className="mt-4 text-base leading-relaxed">
        {moveTitle(marked?.card ?? null)}
        {" → "}
        здесь мог быть другой ход
        {next ? ` → ${moveTitle(next.card)}` : ""}
      </p>
      <div className="mt-6 grid gap-1" role="group" aria-label="Где другой ход">
        {run.moves.map((move, moveIndex) => (
          <ChoiceNode key={moveIndex} selected={moveIndex === index} onClick={() => onChange(chooseFork(run, moveIndex))}>
            {move.actText}
          </ChoiceNode>
        ))}
      </div>
      <div className="mt-6 grid gap-1" role="group" aria-label="Другой ход">
        {CARD_IDS.map((card) => (
          <ChoiceNode
            key={card}
            selected={run.alternativeCard === card}
            onClick={() => {
              const nextRun = chooseAlternative(run, card)
              if (typeof nextRun === "string") {
                setError("Это тот же ход.")
                return
              }
              setError("")
              onChange(nextRun)
            }}
          >
            {CARD_NAME[card]}
          </ChoiceNode>
        ))}
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Button
        type="button"
        size="lg"
        className="mt-6 h-12 w-full text-base sm:w-auto sm:min-w-52"
        onClick={() => {
          const nextRun = openCompare(run)
          if (nextRun.screen === "compare") onChange(nextRun)
          else setError("Выбери другой ход.")
        }}
      >
        Дальше
      </Button>
    </div>
  )
}

function CompareStep({ run, onChange }: FlowProps) {
  const could = couldCards(run)
  const [words, setWords] = useState(run.tryAction)
  const [error, setError] = useState("")
  return (
    <form
      className="my-auto flex w-full max-w-xl flex-col"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const next = asRun(submitTry(run, words))
        if (!next) {
          setError("Напиши одно маленькое действие.")
          return
        }
        onChange(next)
      }}
    >
      <Wordmark />
      <RouteColumn title="Было" cards={run.moves.map((move) => move.card)} moves={run.moves} />
      <RouteColumn title="Могло бы быть иначе" cards={could} moves={run.moves} />
      <Label htmlFor="try-action" className="mt-8 text-base">
        Какое одно маленькое действие ты могла бы попробовать?
      </Label>
      <Input
        id="try-action"
        value={words}
        maxLength={280}
        className={fieldClass}
        onChange={(event) => {
          setWords(event.target.value)
          if (error) setError("")
        }}
      />
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" size="lg" className="mt-6 h-12 w-full text-base sm:w-auto sm:min-w-52">
        Дальше
      </Button>
    </form>
  )
}

function ResultStep({ run, onRestart }: { run: Run; onRestart: () => void }) {
  const could = couldCards(run)
  return (
    <div className="my-auto flex w-full max-w-xl flex-col">
      <Wordmark />
      <p className="mt-5 text-sm text-[var(--olno-burgundy-soft)]">Одно действие</p>
      <h1 className="mt-2 font-display text-[clamp(2rem,8vw,3.25rem)] leading-tight font-semibold tracking-[-0.03em]">
        {run.tryAction}
      </h1>
      <RouteColumn title="Было" cards={run.moves.map((move) => move.card)} moves={run.moves} />
      <RouteColumn title="Могло бы быть иначе" cards={could} moves={run.moves} />
      <button type="button" className="mt-8 w-fit bg-transparent p-0 text-base text-[var(--olno-burgundy-soft)]" onClick={onRestart}>
        Другая ситуация
      </button>
    </div>
  )
}

function RouteColumn({
  title,
  cards,
  moves,
}: {
  title: string
  cards: readonly (Run["moves"][number]["card"])[]
  moves: Run["moves"]
}) {
  return (
    <section className="mt-6">
      <h2 className="text-sm text-[var(--olno-burgundy-soft)]">{title}</h2>
      <ol className="mt-3 grid gap-3">
        {moves.map((move, index) => (
          <li key={index}>
            <p className="text-sm text-[var(--olno-burgundy-soft)]">{moveTitle(cards[index] ?? null)}</p>
            <p className="text-base leading-relaxed">{move.actText}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Alert({ children }: { children: string }) {
  return (
    <p role="alert" className="mt-2 text-sm text-[var(--olno-burgundy)]">
      {children}
    </p>
  )
}
