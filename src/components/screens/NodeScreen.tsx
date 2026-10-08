import { useState, type FormEvent } from "react"
import type { TextSource } from "@/game/types"
import { ChoiceNode } from "@/components/ChoiceNode"
import { PathMark } from "@/components/PathMark"
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
  initialText?: string
  initialSource?: TextSource | null
  onCommit: (text: string, source: TextSource) => "empty" | void
}

const shift = ["md:pl-0", "md:pl-[6%]", "md:pl-[2%]", "md:pl-[10%]", "md:pl-[3%]", "md:pl-[7%]"]

export function NodeScreen({
  index,
  total,
  title,
  question,
  phrases,
  keptText,
  keepSource = "own",
  initialText = "",
  initialSource = null,
  onCommit,
}: NodeScreenProps) {
  const matchedPhrase =
    initialSource === "card" ? (phrases?.find((phrase) => phrase.text === initialText)?.id ?? null) : null
  const [phraseId, setPhraseId] = useState<string | null>(matchedPhrase)
  const [words, setWords] = useState(() => {
    if (!initialText || matchedPhrase) return ""
    if (keptText && initialText === keptText && initialSource !== "own") return ""
    return initialText
  })
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
  const chosen = Boolean(phraseId) || refine

  return (
    <form className="my-auto flex w-full flex-col" onSubmit={handleSubmit}>
      <Wordmark />
      <div
        className={cn(
          "mt-5",
          phrases
            ? "md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-4"
            : "mx-auto w-full max-w-xl",
        )}
      >
        <div className="md:col-span-5">
          <p className="text-sm text-[var(--olno-burgundy-soft)]">
            Узел {index} из {total} · {title}
          </p>
          <h1 className="mt-2 max-w-md font-display text-[1.65rem] leading-snug font-semibold tracking-[-0.03em] md:text-3xl">
            {question}
          </h1>
          {keptText ? (
            <div className="mt-6 flex max-w-md items-start gap-3">
              <PathMark active />
              <blockquote className="min-w-0 text-base leading-relaxed text-[var(--olno-burgundy)]">{keptText}</blockquote>
            </div>
          ) : null}
          {phrases ? null : (
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
              Это то, с чем ты пришёл. Можно оставить или уточнить своими словами.
            </p>
          )}
        </div>

        {phrases ? (
          <div className="relative mt-6 md:col-span-7 md:col-start-6 md:row-span-3 md:mt-0 md:row-start-1" role="group" aria-label="Фразы">
            <div className="absolute top-2 bottom-2 left-[1.35rem] w-px bg-[var(--olno-line)] md:left-5" aria-hidden />
            <div className="grid gap-1">
              {phrases.map((phrase, phraseIndex) => {
                const selected = phrase.id === phraseId
                return (
                  <div
                    key={phrase.id}
                    className={cn(phraseIndex % 2 === 0 ? "pl-0" : "pl-4", shift[phraseIndex] ?? "md:pl-0")}
                  >
                    <ChoiceNode
                      selected={selected}
                      quiet={chosen && !selected}
                      onClick={() => {
                        setPhraseId(phrase.id)
                        setWords("")
                        setError("")
                      }}
                    >
                      {phrase.text}
                    </ChoiceNode>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-6 max-w-md md:col-span-5 md:mt-2">
          <Label htmlFor="node-words" className="text-base">
            {phrases ? "Или своими словами" : "Уточнить своими словами"}
          </Label>
          <Input
            id="node-words"
            value={words}
            maxLength={280}
            placeholder={phrases ? "Одна фраза своими словами" : "Если хочешь сказать точнее"}
            aria-invalid={Boolean(error)}
            className="mt-2 h-12 border-[var(--olno-line)] bg-transparent px-3 text-base md:text-base"
            onChange={(event) => {
              setWords(event.target.value)
              if (event.target.value.trim()) setPhraseId(null)
              if (error) setError("")
            }}
          />
          {error ? (
            <p role="alert" className="mt-2 text-sm text-[var(--olno-burgundy)]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-5 md:col-span-5 md:mt-2">
          <Button type="submit" size="lg" className="h-12 w-full text-base sm:w-auto sm:min-w-52">
            {phrases ? "Записать узел" : refine ? "Записать свои слова" : "Оставить так"}
          </Button>
        </div>
      </div>
    </form>
  )
}
