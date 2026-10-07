import type { ReactNode } from "react"
import { AmbientBackground } from "@/components/atmosphere/AmbientBackground"

type AtmosphereProps = {
  children: ReactNode
}

/** Visual space only. It does not read or write the game. */
export function Atmosphere({ children }: AtmosphereProps) {
  return (
    <div className="relative isolate min-h-dvh bg-[var(--olno-ivory)] text-[var(--olno-burgundy)]">
      <AmbientBackground />
      {children}
    </div>
  )
}
