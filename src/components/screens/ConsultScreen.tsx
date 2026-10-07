import { OLGA_CONSULT_URL } from "@/game/consult"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/Wordmark"

type ConsultScreenProps = {
  situationText: string
  onBack: () => void
}

export function ConsultScreen({ situationText, onBack }: ConsultScreenProps) {
  return (
    <div className="grid min-h-[calc(100dvh-6rem)] content-between gap-12 md:grid-cols-12">
      <div className="max-w-md md:col-span-6 md:self-start">
        <Wordmark />
        <p className="mt-8 text-sm text-[var(--olno-burgundy-soft)]">Консультация</p>
        <h1 className="mt-1 font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
          Разобрать карту с Ольгой
        </h1>
        <p className="mt-6 text-base leading-relaxed">
          Если хочешь посмотреть на эту ситуацию глубже, карту можно принести на консультацию к Ольге.
        </p>
        <p className="mt-6 text-sm text-[var(--olno-burgundy-soft)]">Ситуация: {situationText}</p>
        {OLGA_CONSULT_URL ? (
          <a href={OLGA_CONSULT_URL} className="mt-6 inline-block text-base underline decoration-[var(--olno-gold)] underline-offset-4">
            Перейти
          </a>
        ) : null}
      </div>
      <div className="md:col-span-4 md:col-start-8 md:self-end">
        <Button type="button" size="lg" variant="outline" className="h-12 w-full border-[var(--olno-line)] bg-transparent text-base sm:w-auto" onClick={onBack}>
          Вернуться к карте
        </Button>
      </div>
    </div>
  )
}
