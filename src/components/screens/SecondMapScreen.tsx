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
    <div className="my-auto w-full">
      <div className="md:grid md:grid-cols-12 md:items-start md:gap-x-6">
        <div className="md:col-span-4">
          <Wordmark />
          <p className="mt-5 text-sm text-[var(--olno-burgundy-soft)]">Две петли</p>
          <h1 className="mt-1 max-w-xs font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
            Твоя карта
          </h1>
          <p className="mt-4 max-w-xs text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
            Ситуация та же. В одной петле заменено одно место — твоя формулировка.
          </p>
        </div>
        <div className="mt-6 md:col-span-8 md:mt-0">
          <LoopMap
            nodes={now}
            branch={otherwise}
            draw="still"
            variant="panel"
            keptCaption="Как происходит сейчас"
            branchCaption="Как могло бы быть иначе"
          />
        </div>
      </div>

      {saveError ? (
        <p role="alert" className="mt-4 text-sm text-[var(--olno-burgundy)]">
          {saveError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" size="lg" className="h-12 w-full text-base sm:w-auto sm:min-w-52" onClick={() => void saveMap()}>
          Сохранить карту
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 w-full border-[var(--olno-line)] bg-transparent text-base sm:w-auto"
          onClick={onRestart}
        >
          Начать заново
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 w-full border-[var(--olno-line)] bg-transparent text-base sm:w-auto"
          onClick={onConsult}
        >
          Разобрать карту с Ольгой
        </Button>
      </div>
    </div>
  )
}
