import { cn } from "@/lib/utils"

export function ParklyMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-2/3">
        <path
          d="M7 19V5h6a4 4 0 0 1 0 8H7"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function ParklyLogo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const mark = size === "lg" ? "size-10" : size === "sm" ? "size-7" : "size-8"
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg"
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ParklyMark className={mark} />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", text)}>Parkly</span>
      )}
    </div>
  )
}
