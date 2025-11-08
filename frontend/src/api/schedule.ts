/**
 * 생산 일정 관련 API
 */

import { fetchWithRetry } from '../utils/fetchWithRetry';
import { API_BASE_URL, createAuthHeaders } from './auth';

export interface ProductionScheduleDate {
  id: number;
  date: string; // YYYY-MM-DD
  max_capacity: number;
  reserved_quantity: number;
  is_available: boolean;
  available_slots: number;
}

export interface ProductionScheduleUpdate {
  max_capacity?: number;
  is_available?: boolean;
}

export interface ProductionScheduleCreate {
  date: string; // YYYY-MM-DD
  max_capacity: number;
  is_available?: boolean;
}

/**
 * 주문 가능한 날짜 목록 조회 (공개 API)
 */
export async function getProductionSchedules(): Promise<ProductionScheduleDate[]> {
  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/production-schedule/available`)
  );
  if (!response.ok) {
    throw new Error('Failed to fetch available dates');
  }
  return response.json();
}

/**
 * 전체 생산 일정 조회 (관리자 전용)
 */
export async function getAllProductionSchedules(
  token: string | null,
  startDate?: string,
  endDate?: string
): Promise<ProductionScheduleDate[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = `${API_BASE_URL}/api/production-schedule/admin${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetchWithRetry(
    () => fetch(url, {
      method: 'GET',
      headers,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to fetch production schedule');
  }

  return response.json();
}

/**
 * 생산 일정 생성 (관리자 전용)
 */
export async function createProductionSchedule(
  data: ProductionScheduleCreate,
  token: string | null
): Promise<ProductionScheduleDate> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/production-schedule/admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create production schedule');
  }

  return response.json();
}

/**
 * 생산 일정 수정 (관리자 전용)
 */
export async function updateProductionSchedule(
  date: string, // YYYY-MM-DD
  data: ProductionScheduleUpdate,
  token: string | null
): Promise<ProductionScheduleDate> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/production-schedule/admin/${date}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update production schedule');
  }

  return response.json();
}

/**
 * 생산 일정 비활성화 (관리자 전용)
 */
export async function disableProductionSchedule(
  date: string, // YYYY-MM-DD
  token: string | null
): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/production-schedule/admin/${date}`, {
      method: 'DELETE',
      headers,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to disable production schedule');
  }
}

/**
 * 특정 날짜의 주문 목록 조회 (관리자 전용)
 */
export async function getProductionScheduleOrders(
  date: string, // YYYY-MM-DD
  token: string | null
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/production-schedule/admin/${date}/orders`, {
      method: 'GET',
      headers,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to fetch date orders');
  }

  return response.json();
}
