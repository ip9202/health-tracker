/**
 * TAG-DATA-TASK-008: GET /api/inbody/[id] 엔드포인트 구현
 * TAG-DATA-TASK-009: DELETE /api/inbody/[id] 엔드포인트 구현
 * SPEC-DATA-005-03: 단일 레코드 상세 조회
 * SPEC-DATA-005-04: 레코드 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 인증 검증 (SPEC-AUTH-001 통합)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다', errorCode: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    // 레코드 조회
    const record = await prisma.inBodyRecord.findUnique({
      where: { id },
    });

    // 레코드 없음
    if (!record) {
      return NextResponse.json(
        {
          error: '레코드를 찾을 수 없습니다',
          errorCode: 'NOT_FOUND',
        },
        { status: 404 },
      );
    }

    // 사용자 권한 검증
    if (record.userId !== userId) {
      return NextResponse.json(
        {
          error: '접근 권한이 없습니다',
          errorCode: 'FORBIDDEN',
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: '조회 실패',
        errorCode: 'QUERY_FAILURE',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/inbody/[id]
 * 체성분 레코드 삭제
 * SPEC-DATA-005-04
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 인증 검증 (SPEC-AUTH-001 통합)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다', errorCode: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    // 레코드 조회 (권한 검증용)
    const record = await prisma.inBodyRecord.findUnique({
      where: { id },
    });

    // 레코드 없음
    if (!record) {
      return NextResponse.json(
        {
          error: '레코드를 찾을 수 없습니다',
          errorCode: 'NOT_FOUND',
        },
        { status: 404 },
      );
    }

    // 사용자 권한 검증
    if (record.userId !== userId) {
      return NextResponse.json(
        {
          error: '접근 권한이 없습니다',
          errorCode: 'FORBIDDEN',
        },
        { status: 403 },
      );
    }

    // TODO: 연관 이미지 파일 삭제 (파일 시스템 또는 S3)

    // 레코드 삭제
    await prisma.inBodyRecord.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: '레코드가 삭제되었습니다',
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: '삭제 실패',
        errorCode: 'DELETE_FAILURE',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}
