import { useState, type FormEvent } from "react"
import type { TextSource } from "@/game/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wordmark } from "@/components/Wordmark"
import { cn } from "cn"

type Phrase = { id: string; text: string }

type NodeScreenProps = {
  index: number
  total: number
  title: string
  question: string
  phrases?: readonly Phrase[]
  keptText?: string
  keepSource?: TextSource
  onCommit: (text: string, source: TextSource) => "empty" | void
}

export function NodeScreen({
  index,
  total,
  title,
  question,
  phrases,
  keptText,
  keepSource = "own",
  onCommit,
}: NodeScreenProps) {
  const [phraseId, setPhraseId] = useState<string | null>(null)
  const [words, setWords] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const own = words.trim()
    if (own) {
      const result = onCommit(own, "own")
      setError(result === "empty" ? "Напиши своими словами." : "")
      return
    }

    if (!phrases && keptText) {
      onCommit(keptText, keepSource)
      return
    }

    const phrase = phrases?.find((item) => item.id === phraseId)
    if (!phrase) {
      setError("Выбери фразу или напиши своими словами.")
      return
    }
    const result = onCommit(phrase.text, "card")
    setError(result === "empty" ? "Выбери фразу или напиши своими словами." : "")
  }

  const refine = words.trim().length > 0

  return (
    <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
      <Wordmark />
      <p className="mt-8 text-sm text-muted-foreground">
        Узел {index} из {total} · {title}
      </p>
      <h1 className="mt-3 font-display text-[1.75rem] leading-snug font-semibold tracking-[-0.03em] md:text-4xl">
        {question}
      </h1>

      {keptText ? (
        <blockquote className="mt-6 rounded-2xl border border-border bg-card px-4 py-4 text-base leading-relaxed">
          {keptText}
        </blockquote>
      ) : null}

      {phrases ? (
        <div className="mt-6 grid gap-2" role="group" aria-label="Фразы">
          {phrases.map((phrase) => {
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
      ) : (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Это то, с чем ты пришёл. Можно оставить или уточнить своими словами.
        </p>
      )}

      <div className="mt-6">
        <Label htmlFor="node-words" className="text-base">
          {phrases ? "Или своими словами" : "Уточнить своими словами"}
        </Label>
        <Input
          id="node-words"
          value={words}
          maxLength={280}
          placeholder={phrases ? "Одна фраза своими словами" : "Если хочешь сказать точнее"}
          aria-invalid={Boolean(error)}
          className="mt-2 h-12 bg-card px-3 text-base md:text-base"
          onChange={(event) => {
            setWords(event.target.value)
            if (event.target.value.trim()) setPhraseId(null)
            if (error) setError("")
          }}
        />
        {error ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-auto pt-10">
        <Button type="submit" size="lg" className="h-12 w-full text-base">
          {phrases ? "Записать узел" : refine ? "Записать свои слова" : "Оставить так"}
        </Button>
      </div>
    </form>
  )
}
