import type { ReactNode } from "react"
import { Atmosphere } from "@/components/atmosphere/Atmosphere"
import { cn } from "cn"

type ShellProps = {
  children: ReactNode
  screen: string
  width?: "wide" | "prose"
}

export function Shell({ children, screen, width = "prose" }: ShellProps) {
  return (
    <Atmosphere>
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-none flex-col px-10 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-16 md:pt-10",
        )}
        data-screen={screen}
        data-width={width}
      >
        {children}
      </div>
    </Atmosphere>
  )
}
