import { LoopMap, type LoopNodeView } from "@/components/LoopMap"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/Wordmark"

type LoopScreenProps = {
  nodes: readonly LoopNodeView[]
  onContinue: () => void
}

export function LoopScreen({ nodes, onContinue }: LoopScreenProps) {
  return (
    <div className="my-auto grid w-full items-center gap-8 md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] md:gap-x-12">
      <div className="max-w-xs">
        <Wordmark />
        <h1 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-4xl">
          Посмотри на свою петлю
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--olno-burgundy-soft)]">
          Вот как эта ситуация выглядит твоими словами.
        </p>
        <Button type="button" size="lg" className="mt-6 hidden h-12 px-6 text-base md:inline-flex" onClick={onContinue}>
          Дальше
        </Button>
      </div>

      <LoopMap nodes={nodes} draw="enter" variant="stage" />

      <Button type="button" size="lg" className="h-12 w-full text-base md:hidden" onClick={onContinue}>
        Дальше
      </Button>
    </div>
  )
}
