import { cn } from "cn"

export function BotanicalLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 168" fill="none" className={cn("h-40 w-auto", className)} aria-hidden>
      <path
        d="M32 160C32 108 14 72 32 8C50 72 32 108 32 160Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M32 148C32 96 24 58 32 22" stroke="currentColor" strokeWidth="1.15" />
      <path d="M32 120C24 104 18 96 14 88" stroke="currentColor" strokeWidth="1.15" />
      <path d="M32 100C40 86 46 78 52 68" stroke="currentColor" strokeWidth="1.15" />
      <path d="M32 78C26 66 22 58 18 48" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  )
}
