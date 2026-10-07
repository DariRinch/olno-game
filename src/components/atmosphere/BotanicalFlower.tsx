import { cn } from "cn"

export function BotanicalFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 120" fill="none" className={cn("h-24 w-auto", className)} aria-hidden>
      <path d="M44 112C44 86 44 70 44 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 90C34 82 26 80 18 76" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M44 52C44 40 34 32 34 22C34 32 24 40 24 52C24 40 34 32 44 22C54 32 64 40 64 52C64 40 54 32 54 22C54 32 44 40 44 52Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="44" cy="22" r="1.4" fill="currentColor" />
    </svg>
  )
}
