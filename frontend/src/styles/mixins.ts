/**
 * 3D QR 플랫폼 - 스타일 믹스인
 * 재사용 가능한 스타일 패턴
 */

import type { CSSProperties } from 'react';
import { tokens } from './tokens';

/**
 * 모바일에서 사용하는 텍스트 그림자 효과
 * 배경에 관계없이 텍스트를 읽기 쉽게 만듦
 */
export const mobileTextShadow = (): CSSProperties => ({
  textShadow: '0 0 6px rgba(255,255,255,0.9)',
});

/**
 * 강한 모바일 텍스트 그림자 (더 두드러진 효과)
 */
export const mobileTextShadowStrong = (): CSSProperties => ({
  textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.9)',
});

/**
 * 버튼 호버 효과를 위한 기본 스타일
 */
export const buttonHoverEffect = (): CSSProperties => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
});

/**
 * 카드 스타일 (패널, 모달 등에 사용)
 */
export const cardStyle = (): CSSProperties => ({
  backgroundColor: '#fff',
  borderRadius: tokens.borderRadius.lg,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  padding: tokens.spacing.lg,
});

/**
 * 모달 오버레이 스타일
 */
export const overlayStyle = (zIndex: number = tokens.zIndex.overlay): CSSProperties => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: tokens.colors.UI.OVERLAY,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex,
});

/**
 * 스크롤 가능한 컨테이너 스타일
 */
export const scrollableContainer = (): CSSProperties => ({
  overflowY: 'auto',
  overflowX: 'hidden',
});

/**
 * Flexbox 중앙 정렬
 */
export const flexCenter = (): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * Flexbox 컬럼 레이아웃
 */
export const flexColumn = (gap?: keyof typeof tokens.spacing): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  ...(gap && { gap: tokens.spacing[gap] }),
});

/**
 * Flexbox 로우 레이아웃
 */
export const flexRow = (gap?: keyof typeof tokens.spacing): CSSProperties => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  ...(gap && { gap: tokens.spacing[gap] }),
});

/**
 * 텍스트 말줄임 (ellipsis)
 */
export const textEllipsis = (): CSSProperties => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/**
 * 다중 라인 텍스트 말줄임
 */
export const textEllipsisMultiline = (lines: number): CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

/**
 * 비활성화된 요소 스타일
 */
export const disabledStyle = (): CSSProperties => ({
  opacity: 0.6,
  cursor: 'not-allowed',
  pointerEvents: 'none',
});

/**
 * 기본 입력 필드 스타일
 */
export const inputStyle = (): CSSProperties => ({
  padding: tokens.spacing.sm,
  border: `1px solid ${tokens.colors.UI.BORDER}`,
  borderRadius: tokens.borderRadius.sm,
  fontSize: tokens.fontSize.md,
  width: '100%',
  boxSizing: 'border-box',
});

/**
 * 기본 라벨 스타일
 */
export const labelStyle = (): CSSProperties => ({
  fontSize: tokens.fontSize.sm,
  fontWeight: '500',
  color: tokens.colors.UI.TEXT_PRIMARY,
  marginBottom: tokens.spacing.xs,
  display: 'block',
});
