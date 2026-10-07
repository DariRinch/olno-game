import logoUrl from "@/assets/olno-logo.png"
import { Button } from "@/components/ui/button"

type HomeScreenProps = {
  onStart: () => void
}

function HomeRoute({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 420" fill="none" className={className} aria-hidden>
      <path
        d="M46 48H250V200H70V340H274"
        stroke="var(--olno-gold)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        className="path-draw"
      />
      <circle cx="46" cy="48" r="6" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="250" cy="48" r="6" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="250" cy="200" r="6" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="70" cy="340" r="6" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="46" cy="48" r="1.7" fill="var(--olno-gold)" />
      <circle cx="250" cy="48" r="1.7" fill="var(--olno-gold)" />
      <circle cx="250" cy="200" r="1.7" fill="var(--olno-gold)" />
      <circle cx="70" cy="340" r="1.7" fill="var(--olno-gold)" />
    </svg>
  )
}

function PhoneRoute() {
  return (
    <svg viewBox="0 0 36 220" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M18 8V212"
        stroke="var(--olno-gold)"
        strokeWidth="1.25"
        strokeLinecap="round"
        pathLength={100}
        className="path-draw"
      />
      <circle cx="18" cy="8" r="4.5" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="18" cy="74" r="4.5" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="18" cy="140" r="4.5" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="18" cy="206" r="4.5" fill="var(--olno-ivory)" stroke="var(--olno-burgundy)" />
      <circle cx="18" cy="8" r="1.4" fill="var(--olno-gold)" />
      <circle cx="18" cy="74" r="1.4" fill="var(--olno-gold)" />
      <circle cx="18" cy="140" r="1.4" fill="var(--olno-gold)" />
      <circle cx="18" cy="206" r="1.4" fill="var(--olno-gold)" />
    </svg>
  )
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="relative grid min-h-[calc(100dvh-5.5rem)] items-start gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-stretch md:gap-x-16">
      <div className="relative max-w-xl pr-14 md:self-end md:pr-0 md:pb-[8vh]">
        <h1 className="m-0 max-w-[12rem] sm:max-w-[16rem] md:max-w-[20rem]">
          <img
            src={logoUrl}
            alt="ОЛНО"
            width={565}
            height={238}
            className="block h-auto w-full object-contain"
          />
        </h1>
        <p className="mt-8 font-display text-2xl leading-snug text-[var(--olno-burgundy)] md:text-[1.85rem]">
          Карта своей ситуации
        </p>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
          Собираешь петлю своими словами: что происходит, что в этот момент внутри,
          что ты делаешь и к чему это обычно приводит. Потом можно посмотреть одно место иначе.
        </p>
        <p className="mt-3 text-sm text-[var(--olno-burgundy-soft)]">
          Одна ситуация. Обычно это десять–пятнадцать минут.
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-8 h-12 w-full px-6 text-base sm:w-auto sm:min-w-52"
          onClick={onStart}
        >
          Начать игру
        </Button>
        <p className="mt-6 text-sm text-[var(--olno-burgundy-soft)]">Ольга Новикова</p>
        <div className="pointer-events-none absolute top-28 right-0 bottom-6 w-8 md:hidden" aria-hidden>
          <PhoneRoute />
        </div>
      </div>

      <div className="pointer-events-none hidden items-center justify-end md:flex">
        <HomeRoute className="h-[min(64vh,520px)] w-[min(100%,460px)]" />
      </div>
    </div>
  )
}
