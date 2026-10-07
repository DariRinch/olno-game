import { cn } from "cn"

type WordmarkProps = {
  size?: "hero" | "compact"
  as?: "h1" | "p"
  className?: string
}

export function Wordmark({ size = "compact", as = "p", className }: WordmarkProps) {
  const Tag = as

  return (
    <Tag
      className={cn(
        "font-display font-semibold tracking-[-0.045em] text-foreground",
        size === "hero"
          ? "text-[clamp(4.25rem,20vw,7.75rem)] leading-[0.82]"
          : "text-[1.7rem] leading-none",
        className,
      )}
    >
      ОЛНО
    </Tag>
  )
}
