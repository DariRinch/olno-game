import { cn } from "cn"

type PathMarkProps = {
  active?: boolean
  quiet?: boolean
  className?: string
}

export function PathMark({ active = false, quiet = false, className }: PathMarkProps) {
  return (
    <span
      className={cn("relative grid size-11 shrink-0 place-items-center", quiet && !active && "opacity-70", className)}
      aria-hidden
    >
      <span className="absolute inset-[5px] rounded-full bg-[var(--olno-ivory)]" />
      <span
        className={cn(
          "absolute inset-[5px] rounded-full border-[var(--olno-burgundy)]",
          active ? "border-2" : "border",
        )}
      />
      <span className={cn("relative rounded-full bg-[var(--olno-gold)]", active ? "size-2" : "size-1.5")} />
    </span>
  )
}
