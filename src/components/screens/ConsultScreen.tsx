import { OLGA_CONSULT_URL } from "@/game/consult"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/Wordmark"

type ConsultScreenProps = {
  situationText: string
  onBack: () => void
}

export function ConsultScreen({ situationText, onBack }: ConsultScreenProps) {
  return (
    <div className="flex flex-1 flex-col">
      <Wordmark />
      <p className="mt-8 text-sm text-muted-foreground">Консультация</p>
      <h1 className="mt-1 font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
        Разобрать карту с Ольгой
      </h1>
      <p className="mt-6 text-base leading-relaxed">
        Если хочешь посмотреть на эту ситуацию глубже, карту можно принести на консультацию к Ольге.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">Ситуация: {situationText}</p>
      {OLGA_CONSULT_URL ? (
        <a href={OLGA_CONSULT_URL} className="mt-6 text-base underline underline-offset-4">
          Перейти
        </a>
      ) : null}
      <div className="mt-auto pt-10">
        <Button type="button" size="lg" variant="outline" className="h-12 w-full bg-card text-base" onClick={onBack}>
          Вернуться к карте
        </Button>
      </div>
    </div>
  )
}
