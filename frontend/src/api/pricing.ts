/**
 * 가격 설정 관련 API
 */

import { fetchWithRetry } from '../utils/fetchWithRetry';
import { API_BASE_URL, createAuthHeaders } from './auth';

export interface PricingSettings {
  base_price: number;
  card_base_price: number;
  text_price: number;
  image_price: number;
  announcement_message?: string;
  available_colors?: string;
  allowed_combinations?: string;
  color_warning_message?: string;
}

/**
 * 가격 설정 조회
 */
export async function getPricingSettings(): Promise<PricingSettings> {
  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/pricing`)
  );

  if (!response.ok) {
    throw new Error('Failed to fetch pricing settings');
  }
  return response.json();
}

/**
 * 가격 설정 업데이트 (관리자용)
 */
export async function updatePricingSettings(
  settings: PricingSettings,
  token?: string | null
): Promise<PricingSettings> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const response = await fetch(`${API_BASE_URL}/api/pricing`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update pricing' }));
    throw new Error(error.detail || 'Failed to update pricing');
  }
  return response.json();
}
