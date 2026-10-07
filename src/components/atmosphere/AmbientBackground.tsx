import { BotanicalBranch } from "@/components/atmosphere/BotanicalBranch"
import { BotanicalFlower } from "@/components/atmosphere/BotanicalFlower"
import { BotanicalLeaf } from "@/components/atmosphere/BotanicalLeaf"

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[var(--olno-ivory)]" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--olno-gold)_12%,transparent),transparent_70%)]" />
      <div className="absolute -right-24 -bottom-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--olno-burgundy)_8%,transparent),transparent_72%)]" />

      <div className="absolute top-3 right-0 h-52 w-8 overflow-hidden md:w-14">
        <BotanicalBranch className="ambient-sway absolute top-0 -right-8 h-52 text-[var(--olno-burgundy)] opacity-75 md:-right-12" />
      </div>
      <div className="absolute bottom-3 left-0 h-40 w-8 overflow-hidden md:w-12">
        <BotanicalLeaf className="absolute bottom-0 left-0 h-36 text-[var(--olno-gold)] opacity-80" />
      </div>
      <div className="absolute right-1 bottom-4 hidden h-28 w-12 overflow-hidden md:block">
        <BotanicalFlower className="absolute right-0 bottom-0 h-28 text-[var(--olno-burgundy)] opacity-70" />
      </div>
      <div className="absolute top-6 left-0 hidden h-36 w-12 overflow-hidden lg:block">
        <BotanicalLeaf className="absolute top-0 left-0 h-32 text-[var(--olno-burgundy)] opacity-60" />
      </div>

      <svg className="absolute inset-0 h-full w-full opacity-[0.03]" aria-hidden>
        <filter id="olno-atmosphere-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#olno-atmosphere-noise)" />
      </svg>
    </div>
  )
}
