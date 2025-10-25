/**
 * 403 에러 시 자동 재시도하는 fetch 래퍼
 * Clerk JWKS 캐시 로딩 문제로 인한 403 응답을 처리
 */
export async function fetchWithRetry(
  fetchFn: () => Promise<Response>,
  retries: number = 1,
  delayMs: number = 500
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchFn();

      // 403 에러이고 재시도 가능한 경우
      if (response.status === 403 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}
