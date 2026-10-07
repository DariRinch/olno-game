import { cn } from "cn"

export function OrganicShape({
  className,
  variant = "pool",
}: {
  className?: string
  variant?: "pool" | "stone"
}) {
  const d =
    variant === "pool"
      ? "M48 86C28 62 18 28 52 16C92 2 126 28 138 62C152 102 118 146 74 138C40 132 58 104 48 86Z"
      : "M70 24C104 8 150 30 158 68C168 112 130 156 84 150C36 144 18 100 32 64C42 40 48 34 70 24Z"

  return (
    <svg viewBox="0 0 180 170" className={cn("h-64 w-auto", className)} aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  )
}
