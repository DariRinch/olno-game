import { useState } from "react"
import { downloadMapPng } from "@/components/exportMap"
import { LoopMap, type LoopNodeView } from "@/components/LoopMap"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/Wordmark"

type SecondMapScreenProps = {
  now: readonly LoopNodeView[]
  otherwise: readonly LoopNodeView[]
  onRestart: () => void
  onConsult: () => void
}

export function SecondMapScreen({ now, otherwise, onRestart, onConsult }: SecondMapScreenProps) {
  const [saveError, setSaveError] = useState("")

  async function saveMap() {
    try {
      setSaveError("")
      await downloadMapPng({ now, otherwise })
    } catch {
      setSaveError("Не удалось сохранить файл.")
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Wordmark />
      <p className="mt-8 text-sm text-muted-foreground">Две петли</p>
      <h1 className="mt-1 font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
        Твоя карта
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
        Ситуация та же. В одной петле заменено одно место — твоя формулировка.
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-start">
        <section aria-label="Как происходит сейчас">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
            Как происходит сейчас
          </h2>
          <div className="mt-4">
            <LoopMap nodes={now} />
          </div>
        </section>
        <section aria-label="Как могло бы быть иначе">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
            Как могло бы быть иначе
          </h2>
          <div className="mt-4">
            <LoopMap nodes={otherwise} />
          </div>
        </section>
      </div>

      {saveError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {saveError}
        </p>
      ) : null}

      <div className="mt-10 grid gap-2 md:max-w-sm">
        <Button type="button" size="lg" className="h-12 w-full text-base" onClick={() => void saveMap()}>
          Сохранить карту
        </Button>
        <Button type="button" size="lg" variant="outline" className="h-12 w-full bg-card text-base" onClick={onRestart}>
          Начать заново
        </Button>
        <Button type="button" size="lg" variant="outline" className="h-12 w-full bg-card text-base" onClick={onConsult}>
          Разобрать карту с Ольгой
        </Button>
      </div>
    </div>
  )
}
