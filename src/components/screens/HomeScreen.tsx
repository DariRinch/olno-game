import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/Wordmark"

type HomeScreenProps = {
  onStart: () => void
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col pt-6 md:justify-center md:pt-0">
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-16">
          <div>
            <Wordmark as="h1" size="hero" />
            <div className="mt-5 h-px w-16 bg-copper" />
            <div className="mt-5 flex items-center gap-2" aria-hidden>
              <span className="size-2 rounded-full bg-foreground" />
              <span className="size-2 rounded-full bg-border" />
              <span className="size-2 rounded-full bg-border" />
              <span className="size-2 rounded-full bg-border" />
            </div>
          </div>
          <div className="pb-1">
            <p className="font-display text-2xl leading-snug text-foreground">
              Карта своей ситуации
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Собираешь петлю своими словами: что происходит, что в этот момент внутри,
              что ты делаешь и к чему это обычно приводит. Потом можно посмотреть одно место иначе.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Одна ситуация. Обычно это десять–пятнадцать минут.
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-8 h-12 w-full px-6 text-base md:w-auto md:min-w-52"
              onClick={onStart}
            >
              Начать игру
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">Ольга Новикова</p>
          </div>
        </div>
      </div>
    </div>
  )
}
