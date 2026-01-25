/**
 * Tooltip 컴포넌트
 * shadcn/ui 기반의 툴팁 컴포넌트
 * Radix UI Tooltip를 기반으로 접근성을 지원
 */
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * Tooltip Provider 컴포넌트
 * 툴팁 상태를 관리하는 컨텍스트를 제공
 */
const TooltipProvider = TooltipPrimitive.Provider

/**
 * Tooltip 루트 컴포넌트
 */
const Tooltip = TooltipPrimitive.Root

/**
 * Tooltip 트리거 컴포넌트
 * 호버/포커스 시 툴팁을 표시하는 요소
 */
const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Tooltip 콘텐츠 컴포넌트
 * 툴팁으로 표시할 내용
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
