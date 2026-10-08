import lineUrl from "@/assets/olno-line.webp"
import wordUrl from "@/assets/olno-word.webp"
import { Button } from "@/components/ui/button"

type HomeScreenProps = {
  onStart: () => void
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="mx-auto my-auto w-full max-w-lg">
      <h1 className="m-0">
        <img
          src={wordUrl}
          alt="ОЛНО"
          width={1600}
          height={237}
          className="block h-auto w-full"
        />
      </h1>
      <img
        src={lineUrl}
        alt="Карта твоей ситуации"
        width={1800}
        height={134}
        className="mt-3 block h-auto w-full"
      />
      <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
        Собираешь петлю своими словами: что происходит, что в этот момент внутри,
        что ты делаешь и к чему это обычно приводит. Потом можно посмотреть одно место иначе.
      </p>
      <p className="mt-3 text-sm text-[var(--olno-burgundy-soft)]">
        Одна ситуация. Обычно это десять–пятнадцать минут.
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-6 h-12 w-full px-6 text-base sm:w-auto sm:min-w-52"
        onClick={onStart}
      >
        Начать игру
      </Button>
      <p className="mt-6 text-sm text-[var(--olno-burgundy-soft)]">Ольга Новикова</p>
    </div>
  )
}
