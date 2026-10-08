import type { ReactNode } from "react"
import { Atmosphere } from "@/components/atmosphere/Atmosphere"

type ShellProps = {
  children: ReactNode
  screen: string
  width?: "wide" | "prose"
  onBack?: () => void
}

export function Shell({ children, screen, width = "prose", onBack }: ShellProps) {
  return (
    <Atmosphere>
      <div
        className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 md:px-10 md:pt-6"
        data-screen={screen}
        data-width={width}
      >
        <div className="flex w-full flex-1 flex-col [justify-content:safe_center]">
          {onBack ? (
            <button
              type="button"
              className="mb-5 w-fit bg-transparent p-0 text-left text-base text-[var(--olno-burgundy-soft)]"
              onClick={onBack}
            >
              Назад
            </button>
          ) : null}
          {children}
        </div>
      </div>
    </Atmosphere>
  )
}
