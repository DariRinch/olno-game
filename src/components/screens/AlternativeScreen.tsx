import { useState, type FormEvent } from "react"
import { alternativePhrases, places } from "@/game/cards"
import { changedNodeId } from "@/game/gameEngine"
import type { PlaceId, TextSource } from "@/game/types"
import { ChoiceNode } from "@/components/ChoiceNode"
import { LoopMap, type LoopNodeView } from "@/components/LoopMap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wordmark } from "@/components/Wordmark"

type AlternativeScreenProps = {
  nodes: readonly LoopNodeView[]
  onSubmit: (place: PlaceId, text: string, source: TextSource) => "empty" | void
}

export function AlternativeScreen({ nodes, onSubmit }: AlternativeScreenProps) {
  const [place, setPlace] = useState<PlaceId | null>(null)
  const [phraseId, setPhraseId] = useState<string | null>(null)
  const [words, setWords] = useState("")
  const [error, setError] = useState("")
  const hints = place ? alternativePhrases[place] : []
  const chosen = Boolean(phraseId) || words.trim().length > 0
  const previewText = words.trim() || hints.find((item) => item.id === phraseId)?.text || ""
  const previewBranch =
    place && previewText
      ? nodes.map((node) =>
          node.id === changedNodeId(place)
            ? {
                ...node,
                text: previewText,
                placeLabel: places.find((item) => item.id === place)?.label,
              }
            : node,
        )
      : undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!place) {
      setError("Выбери одно место.")
      return
    }
    const own = words.trim()
    if (own) {
      const result = onSubmit(place, own, "own")
      setError(result === "empty" ? "Напиши свою формулировку." : "")
      return
    }
    const phrase = hints.find((item) => item.id === phraseId)
    if (!phrase) {
      setError("Возьми фразу или напиши свою.")
      return
    }
    const result = onSubmit(place, phrase.text, "card")
    setError(result === "empty" ? "Возьми фразу или напиши свою." : "")
  }

  return (
    <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="xl:grid xl:h-[calc(100dvh-6.5rem)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-x-12">
        <div className="xl:col-start-1 xl:row-start-1">
          <Wordmark />
          <h1 className="mt-5 max-w-xs font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
            Что могло бы быть иначе?
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
            Посмотри на петлю и выбери одно место. Остальные узлы останутся как есть.
          </p>
        </div>

        <div className="mt-8 min-h-0 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:mt-0">
          {nodes.length > 0 ? (
            <LoopMap
              nodes={nodes}
              branch={previewBranch}
              draw="still"
              variant="panel"
              className="xl:!h-full xl:!min-h-0"
              activeId={place ? changedNodeId(place) : undefined}
              keptCaption={previewBranch ? "Как происходит сейчас" : undefined}
              branchCaption={previewBranch ? "Как могло бы быть иначе" : undefined}
            />
          ) : null}
        </div>

        <div className="mt-8 min-w-0 xl:col-start-1 xl:row-start-2 xl:mt-6">
          <div className="relative" role="group" aria-label="Место">
            <div className="absolute top-2 bottom-2 left-[1.35rem] w-px bg-[var(--olno-line)]" aria-hidden />
            <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-4">
              {places.map((item) => {
                const selected = item.id === place
                return (
                  <ChoiceNode
                    key={item.id}
                    selected={selected}
                    quiet={Boolean(place) && !selected}
                    onClick={() => {
                      setPlace(item.id)
                      setPhraseId(null)
                      setError("")
                    }}
                  >
                    {item.label}
                  </ChoiceNode>
                )
              })}
            </div>
          </div>

          {place ? (
            <div className="mt-5 min-w-0">
              <p className="max-w-sm text-sm leading-relaxed text-[var(--olno-burgundy-soft)]">
                Мысль и ожидание относятся к узлу «Внутри». Действие и реакция — к своим узлам.
                Ситуация не меняется.
              </p>
              <div className="relative mt-3 min-w-0" role="group" aria-label="Фразы">
                <div className="absolute top-2 bottom-2 left-[1.35rem] w-px bg-[var(--olno-line)]" aria-hidden />
                <div className="grid min-w-0 gap-1">
                  {hints.map((phrase) => {
                    const selected = phrase.id === phraseId
                    return (
                      <ChoiceNode
                        key={phrase.id}
                        selected={selected}
                        quiet={chosen && !selected}
                        className="max-w-full"
                        onClick={() => {
                          setPhraseId(phrase.id)
                          setWords("")
                          setError("")
                        }}
                      >
                        {phrase.text}
                      </ChoiceNode>
                    )
                  })}
                </div>
              </div>
              <div className="mt-4 max-w-md">
                <Label htmlFor="alternative-words" className="text-base">
                  Или своими словами
                </Label>
                <Input
                  id="alternative-words"
                  value={words}
                  maxLength={280}
                  placeholder="Одна другая формулировка"
                  className="mt-2 h-12 border-[var(--olno-line)] bg-transparent px-3 text-base md:text-base"
                  onChange={(event) => {
                    setWords(event.target.value)
                    if (event.target.value.trim()) setPhraseId(null)
                    if (error) setError("")
                  }}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-3 text-sm text-[var(--olno-burgundy)]">
              {error}
            </p>
          ) : null}

          <div className="mt-5 pb-1">
            <Button type="submit" size="lg" className="h-12 w-full text-base sm:w-auto sm:min-w-52">
              Показать обе петли
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
