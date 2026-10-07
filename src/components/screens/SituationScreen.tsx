import { useState, type FormEvent } from "react"
import { situationThemes } from "@/game/cards"
import type { TextSource } from "@/game/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wordmark } from "@/components/Wordmark"
import { cn } from "cn"

type SituationScreenProps = {
  onSubmit: (text: string, source: TextSource) => "empty" | void
}

export function SituationScreen({ onSubmit }: SituationScreenProps) {
  const [themeId, setThemeId] = useState<string | null>(null)
  const [words, setWords] = useState("")
  const [error, setError] = useState("")

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
    <form className="flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
      <Wordmark />
      <p className="mt-8 text-sm text-muted-foreground">Ситуация</p>
      <h1 className="mt-1 font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
        С чем ты пришёл сегодня?
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Одна тема или свои слова. Это и станет началом карты.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2" role="group" aria-label="Темы">
        {situationThemes.map((theme) => {
          const selected = theme.id === themeId
          return (
            <Button
              key={theme.id}
              type="button"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              className={cn("h-12 text-base", !selected && "bg-card")}
              onClick={() => {
                setThemeId(theme.id)
                if (!theme.asksForWords) setWords("")
                setError("")
              }}
            >
              {theme.label}
            </Button>
          )
        })}
      </div>

      <div className="mt-6">
        <Label htmlFor="situation-words" className="text-base">
          Или своими словами
        </Label>
        <Input
          id="situation-words"
          value={words}
          maxLength={280}
          placeholder="Как ты сам это называешь"
          aria-invalid={Boolean(error)}
          className="mt-2 h-12 bg-card px-3 text-base md:text-base"
          onChange={(event) => {
            setWords(event.target.value)
            if (event.target.value.trim() && themeId !== "other") setThemeId(null)
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
          Дальше
        </Button>
      </div>
    </form>
  )
}
