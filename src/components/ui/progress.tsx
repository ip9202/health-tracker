/**
 * Progress 컴포넌트
 * shadcn/ui 기반의 진행률 표시 바 컴포넌트
 * 작업의 진행 상황을 시각적으로 표시
 */
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  progressBarColor?: string
}

/**
 * Progress 메인 컴포넌트
 * value prop으로 진행률을 0-100 사이의 값으로 전달
 * progressBarColor prop으로 진행 바의 색상을 지정 (선택사항)
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, progressBarColor, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 transition-all", progressBarColor || "bg-primary")}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
