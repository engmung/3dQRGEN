/**
 * 인증 관련 API 유틸리티
 */

import { fetchWithRetry } from '../utils/fetchWithRetry';

// Nginx 프록시를 통한 백엔드 접근 (빈 문자열이면 상대 경로 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Clerk JWT 토큰을 가져오는 함수
 * 이 함수는 Clerk가 제공하는 window.__clerk_session_token을 사용하거나
 * useAuth hook에서 getToken()을 호출할 수 있습니다.
 */
export async function getAuthToken(): Promise<string | null> {
  // Clerk가 로드되었는지 확인
  if (typeof window !== 'undefined' && (window as any).Clerk) {
    try {
      const clerk = (window as any).Clerk;
      const token = await clerk.session?.getToken();
      return token || null;
    } catch (error) {
      console.warn('Failed to get Clerk token:', error);
      return null;
    }
  }
  return null;
}

/**
 * 인증 헤더 생성 헬퍼
 */
export function createAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * 인증이 필요한 API 요청을 위한 래퍼 함수
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  token?: string | null,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  const headers = {
    ...createAuthHeaders(token),
    ...options.headers,
  };

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    }),
    retries,
    delayMs
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

/**
 * API Base URL 노출 (다른 모듈에서 사용)
 */
export { API_BASE_URL };
