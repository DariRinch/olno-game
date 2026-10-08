import { useState, type FormEvent } from "react"
import { situationThemes } from "@/game/cards"
import type { TextSource } from "@/game/types"
import { ChoiceNode } from "@/components/ChoiceNode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wordmark } from "@/components/Wordmark"
import { cn } from "cn"

type SituationScreenProps = {
  initialText?: string
  initialSource?: TextSource | null
  onSubmit: (text: string, source: TextSource) => "empty" | void
}

const shift = [
  "md:pl-0",
  "md:pl-[6%]",
  "md:pl-[2%]",
  "md:pl-[10%]",
  "md:pl-0",
  "md:pl-[5%]",
  "md:pl-[2%]",
]

export function SituationScreen({ initialText = "", initialSource = null, onSubmit }: SituationScreenProps) {
  const [themeId, setThemeId] = useState<string | null>(() => {
    if (initialSource !== "card") return null
    return situationThemes.find((item) => item.label === initialText)?.id ?? null
  })
  const [words, setWords] = useState(() => (initialSource === "own" ? initialText : ""))
  const [error, setError] = useState("")
  const chosen = Boolean(themeId) || words.trim().length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const own = words.trim()
    const theme = situationThemes.find((item) => item.id === themeId)

    if (own) {
      const result = onSubmit(own, "own")
      setError(result === "empty" ? "Напиши своими словами." : "")
      return
    }

    if (theme?.asksForWords) {
      setError("Напиши своими словами.")
      return
    }

    if (!theme) {
      setError("Выбери тему или напиши своими словами.")
      return
    }

    const result = onSubmit(theme.label, "card")
    setError(result === "empty" ? "Выбери тему или напиши своими словами." : "")
  }

  return (
    <form className="my-auto flex w-full flex-col" onSubmit={handleSubmit} noValidate>
      <Wordmark />
      <div className="mt-5 md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-4">
        <div className="md:col-span-5">
          <p className="text-sm text-[var(--olno-burgundy-soft)]">Ситуация</p>
          <h1 className="mt-2 max-w-md font-display text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-4xl">
            С чем ты пришёл сегодня?
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
            Одна тема или свои слова. Это и станет началом карты.
          </p>
        </div>

        <div className="relative mt-6 md:col-span-7 md:col-start-6 md:row-span-3 md:mt-0 md:row-start-1" role="group" aria-label="Темы">
          <div className="absolute top-2 bottom-2 left-[1.35rem] w-px bg-[var(--olno-line)] md:left-5" aria-hidden />
          <div className="grid gap-1">
            {situationThemes.map((theme, index) => {
              const selected = theme.id === themeId
              return (
                <div key={theme.id} className={cn(index % 2 === 0 ? "pl-0" : "pl-5", shift[index] ?? "md:pl-0")}>
                  <ChoiceNode
                    selected={selected}
                    quiet={chosen && !selected}
                    onClick={() => {
                      setThemeId(theme.id)
                      if (!theme.asksForWords) setWords("")
                      setError("")
                    }}
                  >
                    {theme.label}
                  </ChoiceNode>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 max-w-md md:col-span-5 md:mt-2">
          <Label htmlFor="situation-words" className="text-base">
            Или своими словами
          </Label>
          <Input
            id="situation-words"
            value={words}
            maxLength={280}
            placeholder="Как ты сам это называешь"
            aria-invalid={Boolean(error)}
            className="mt-2 h-12 border-[var(--olno-line)] bg-transparent px-3 text-base md:text-base"
            onChange={(event) => {
              setWords(event.target.value)
              if (event.target.value.trim() && themeId !== "other") setThemeId(null)
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
            Дальше
          </Button>
        </div>
      </div>
    </form>
  )
}
