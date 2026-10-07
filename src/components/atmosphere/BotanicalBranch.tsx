import { cn } from "cn"

export function BotanicalBranch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 340" fill="none" className={cn("h-72 w-auto", className)} aria-hidden>
      <path
        d="M28 332C46 260 40 210 78 168C108 134 96 86 130 42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M78 168C96 150 124 146 150 124" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M146 128C154 112 160 104 172 92C166 108 158 118 146 128Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M104 146C118 124 122 100 116 74" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M116 78C126 64 138 58 154 52C140 66 128 74 116 78Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M58 214C78 200 96 198 118 186" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
