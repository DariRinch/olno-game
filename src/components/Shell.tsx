import type { ReactNode } from "react"
import { cn } from "cn"

type ShellProps = {
  children: ReactNode
  screen: string
  width?: "wide" | "prose"
}

export function Shell({ children, screen, width = "prose" }: ShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground" data-screen={screen}>
      <div
        className={cn(
          "mx-auto flex min-h-dvh w-full flex-col px-5 pt-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] md:px-10 md:pt-12",
          width === "wide" ? "max-w-3xl" : "max-w-xl",
        )}
      >
        {children}
      </div>
    </div>
  )
}
