import type { ButtonHTMLAttributes } from "react"
import { Button } from "@/components/ui/button"
import { PathMark } from "@/components/PathMark"
import { cn } from "cn"

type ChoiceNodeProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  quiet?: boolean
}

export function ChoiceNode({ selected = false, quiet = false, className, children, ...props }: ChoiceNodeProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={selected}
      className={cn(
        "h-auto min-h-11 w-fit max-w-full justify-start gap-3 rounded-none bg-transparent px-1 py-1 text-left text-base leading-snug font-normal whitespace-normal text-[var(--olno-burgundy)] shadow-none hover:bg-transparent",
        quiet && !selected && "opacity-45",
        className,
      )}
      {...props}
    >
      <PathMark active={selected} />
      <span className={cn("min-w-0", selected && "font-medium")}>{children}</span>
    </Button>
  )
}
