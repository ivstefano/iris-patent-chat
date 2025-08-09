import React from "react"
import { ReflectiveButton } from "./reflective-button"
import type { LucideIcon } from "lucide-react"

interface PillButtonProps extends React.ComponentProps<typeof ReflectiveButton> {
  children: React.ReactNode
  icon?: LucideIcon
}

export const PillButton = React.forwardRef<
  React.ElementRef<typeof ReflectiveButton>,
  PillButtonProps
>(({ children, icon: Icon, className, ...props }, ref) => {
  return (
    <ReflectiveButton
      variant="outline"
      className={`h-8 px-3 rounded-full bg-gray-200 dark:bg-[#333333] hover:bg-gray-300 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-200 shadow-sm border border-gray-300 dark:border-gray-700 text-[13px] font-medium whitespace-nowrap inline-flex items-center ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 stroke-[1.5px] mr-1.5" />}
      {children}
    </ReflectiveButton>
  )
})

PillButton.displayName = "PillButton"
