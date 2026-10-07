import { LoopMap, type LoopNodeView } from "@/components/LoopMap"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/Wordmark"

type LoopScreenProps = {
  nodes: readonly LoopNodeView[]
  onContinue: () => void
}

export function LoopScreen({ nodes, onContinue }: LoopScreenProps) {
  return (
    <div>
      <div className="max-w-xs md:hidden">
        <Wordmark />
        <h1 className="mt-6 font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
          Посмотри на свою петлю
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
          Вот как эта ситуация выглядит твоими словами.
        </p>
      </div>

      <div className="mt-8 md:mt-0">
        <LoopMap
          nodes={nodes}
          draw="enter"
          variant="stage"
          center={
            <div className="pointer-events-auto w-full max-w-[15rem] text-center">
              <Wordmark className="text-[1.4rem]" />
              <h1 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-[-0.03em]">
                Посмотри на свою петлю
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--olno-burgundy-soft)]">
                Вот как эта ситуация выглядит твоими словами.
              </p>
              <Button type="button" size="lg" className="mt-6 h-12 px-6 text-base" onClick={onContinue}>
                Дальше
              </Button>
            </div>
          }
        />
      </div>

      <div className="mt-8 md:hidden">
        <Button type="button" size="lg" className="h-12 w-full text-base" onClick={onContinue}>
          Дальше
        </Button>
      </div>
    </div>
  )
}
