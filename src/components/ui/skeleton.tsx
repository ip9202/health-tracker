/**
 * Skeleton 컴포넌트
 * 콘텐츠 로딩 중 플레이스홀더로 표시되는 스켈레톤 UI
 */
import React from "react"
import { cn } from "@/lib/utils"

/**
 * Skeleton 메인 컴포넌트
 * 로딩 중인 콘텐츠의 자리를 차지하는 애니메이션 효과
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
