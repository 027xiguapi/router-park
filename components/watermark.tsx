interface WatermarkProps {
  text?: string
  count?: number
  opacity?: number
  darkOpacity?: number
  rotate?: number
  fontSize?: string
}

export function Watermark({
  text = "watermark",
  count = 30,
  opacity = 0.03,
  darkOpacity = 0.05,
  rotate = -25,
  fontSize = "text-4xl",
}: WatermarkProps) {
  return (
    <>
      {/* Light mode watermark */}
      <div
        className="pointer-events-none absolute inset-0 z-50 select-none overflow-hidden dark:hidden"
        style={{ opacity }}
      >
        <div className="flex h-full w-full flex-wrap items-center justify-center">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`m-8 ${fontSize} font-bold text-gray-900`}
              style={{
                fontFamily: "monospace",
                transform: `rotate(${rotate}deg)`,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Dark mode watermark */}
      <div
        className="pointer-events-none absolute inset-0 z-50 hidden select-none overflow-hidden dark:block"
        style={{ opacity: darkOpacity }}
      >
        <div className="flex h-full w-full flex-wrap items-center justify-center">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`m-8 ${fontSize} font-bold text-gray-100`}
              style={{
                fontFamily: "monospace",
                transform: `rotate(${rotate}deg)`,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
