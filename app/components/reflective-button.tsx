"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ReflectiveButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

export function ReflectiveButton({ children, className, onMouseMove, onMouseEnter, onMouseLeave, ...props }: ReflectiveButtonProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setPosition({ x, y })
      onMouseMove?.(e)
    },
    [onMouseMove],
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovering(true)
      onMouseEnter?.(e)
    },
    [onMouseEnter],
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovering(false)
      onMouseLeave?.(e)
    },
    [onMouseLeave],
  )

  return (
    <Button
      {...props}
      className={cn(
        "relative overflow-hidden transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Soft reflective sheen that follows the cursor */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
          isHovering && "opacity-100",
        )}
        style={{
          background: `radial-gradient(200px 200px at ${position.x}% ${position.y}%, rgba(255,255,255,0.12), transparent 60%)`,
        }}
      />
      {/* Subtle top highlight for depth */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-1 h-1/2 bg-gradient-to-b from-white/5 to-transparent"
      />
      {children}
    </Button>
  )
}
