/**
 * TAG-FE-001-UTIL-001: 유틸리티 함수 모음
 * SPEC: SPEC-FE-004
 * DESCRIPTION: shadcn/ui 컴포넌트를 위한 유틸리티 함수
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스들을 병합하는 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 클래스 충돌을 해결
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
