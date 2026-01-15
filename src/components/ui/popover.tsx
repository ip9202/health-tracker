/**
 * Popover 컴포넌트
 * shadcn/ui 기반의 팝오버 컴포넌트
 * Radix UI Popover를 기반으로 트리거 주변에 풍선 도움말을 표시
 */
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * Popover 루트 컴포넌트
 */
const Popover = PopoverPrimitive.Root

/**
 * Popover 트리거 컴포넌트
 * 클릭하여 팝오버를 표시하는 요소
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * Popover 앵커 컴포넌트
 * 팝오버 위치를 기준으로 삼는 요소
 */
const PopoverAnchor = PopoverPrimitive.Anchor

/**
 * Popover 콘텐츠 컴포넌트
 * 팝오버로 표시할 내용
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
