import sheetUrl from "@/assets/olno-sheet.webp"

/** Her paper sheet. It does not read or write the game. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <div className="olno-sheet absolute inset-0" style={{ backgroundImage: `url("${sheetUrl}")` }} />
    </div>
  )
}
