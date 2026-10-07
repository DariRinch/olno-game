import { useState, type FormEvent } from "react"
import { alternativePhrases, places } from "@/game/cards"
import type { PlaceId, TextSource } from "@/game/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wordmark } from "@/components/Wordmark"
import { cn } from "cn"

type AlternativeScreenProps = {
  onSubmit: (place: PlaceId, text: string, source: TextSource) => "empty" | void
}

export function AlternativeScreen({ onSubmit }: AlternativeScreenProps) {
  const [place, setPlace] = useState<PlaceId | null>(null)
  const [phraseId, setPhraseId] = useState<string | null>(null)
  const [words, setWords] = useState("")
  const [error, setError] = useState("")
  const hints = place ? alternativePhrases[place] : []

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
      <Wordmark />
      <h1 className="mt-8 font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
        Что могло бы быть иначе?
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Посмотри на петлю и выбери одно место. Остальные узлы останутся как есть.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2" role="group" aria-label="Место">
        {places.map((item) => {
          const selected = item.id === place
          return (
            <Button
              key={item.id}
              type="button"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              className={cn("h-12 text-base", !selected && "bg-card")}
              onClick={() => {
                setPlace(item.id)
                setPhraseId(null)
                setError("")
              }}
            >
              {item.label}
            </Button>
          )
        })}
      </div>

      {place ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Мысль и ожидание относятся к узлу «Внутри». Действие и реакция — к своим узлам.
            Ситуация не меняется.
          </p>
          <div className="mt-4 grid gap-2" role="group" aria-label="Фразы">
            {hints.map((phrase) => {
              const selected = phrase.id === phraseId
              return (
                <Button
                  key={phrase.id}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  aria-pressed={selected}
                  className={cn(
                    "h-auto min-h-12 w-full justify-start px-4 py-3 text-left text-base whitespace-normal",
                    !selected && "bg-card",
                  )}
                  onClick={() => {
                    setPhraseId(phrase.id)
                    setWords("")
                    setError("")
                  }}
                >
                  {phrase.text}
                </Button>
              )
            })}
          </div>
          <div className="mt-6">
            <Label htmlFor="alternative-words" className="text-base">
              Или своими словами
            </Label>
            <Input
              id="alternative-words"
              value={words}
              maxLength={280}
              placeholder="Одна другая формулировка"
              className="mt-2 h-12 bg-card px-3 text-base md:text-base"
              onChange={(event) => {
                setWords(event.target.value)
                if (event.target.value.trim()) setPhraseId(null)
                if (error) setError("")
              }}
            />
          </div>
        </>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-auto pt-10">
        <Button type="submit" size="lg" className="h-12 w-full text-base">
          Показать обе петли
        </Button>
      </div>
    </form>
  )
}
