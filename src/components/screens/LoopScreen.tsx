import { LoopMap, type LoopNodeView } from "@/components/LoopMap"
import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/Wordmark"

type LoopScreenProps = {
  nodes: readonly LoopNodeView[]
  onContinue: () => void
}

export function LoopScreen({ nodes, onContinue }: LoopScreenProps) {
  return (
    <div className="flex flex-1 flex-col">
      <Wordmark />
      <h1 className="mt-8 font-display text-4xl leading-tight font-semibold tracking-[-0.03em]">
        Посмотри на свою петлю
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
        Вот как эта ситуация выглядит твоими словами.
      </p>
      <div className="mt-8">
        <LoopMap nodes={nodes} />
      </div>
      <div className="mt-auto pt-10">
        <Button type="button" size="lg" className="h-12 w-full text-base md:w-auto md:min-w-52" onClick={onContinue}>
          Дальше
        </Button>
      </div>
    </div>
  )
}
