/**
 * 주문 관련 API (Legacy Orders + Order Groups)
 */

import { fetchWithRetry } from '../utils/fetchWithRetry';
import { API_BASE_URL, getAuthToken, createAuthHeaders } from './auth';

// ==================== Legacy Orders API ====================

export interface Stand {
  id: number;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_model_url: string | null;
  price: number;
}

export interface OrderResponse {
  order_uuid: string;
  payment_url: string;
}

export interface OrderListItem {
  id: number;
  order_uuid: string;
  stand_id: number;
  stand_name: string;
  qr_url: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  customer_postal_code?: string;
  customer_address?: string;
  delivery_message?: string;
  price?: number;
  status: string;
  created_at: string | null;
  stl_file_path?: string;
}

/**
 * 거치대 목록 조회
 */
export async function fetchStands(): Promise<Stand[]> {
  const response = await fetch(`${API_BASE_URL}/api/stands/`);
  if (!response.ok) {
    throw new Error('Failed to fetch stands');
  }
  return response.json();
}

/**
 * 주문 생성 (OBJ+MTL 파일 업로드) - Legacy
 */
export async function createOrder(
  standId: number,
  standName: string,
  qrUrl: string,
  customization: object,
  customerEmail: string,
  customerName: string,
  customerPhone: string,
  customerPostalCode: string,
  customerAddress: string,
  deliveryMessage: string,
  price: number,
  modelObjBlob: Blob,
  modelMtlBlob: Blob
): Promise<OrderResponse> {
  const formData = new FormData();
  formData.append('stand_id', standId.toString());
  formData.append('stand_name', standName);
  formData.append('qr_url', qrUrl);
  formData.append('customization', JSON.stringify(customization));
  formData.append('customer_email', customerEmail);
  formData.append('customer_name', customerName);
  formData.append('customer_phone', customerPhone);
  formData.append('customer_postal_code', customerPostalCode);
  formData.append('customer_address', customerAddress);
  formData.append('delivery_message', deliveryMessage);
  formData.append('price', price.toString());
  formData.append('model_obj_file', modelObjBlob, 'model.obj');
  formData.append('model_mtl_file', modelMtlBlob, 'model.mtl');

  // Clerk JWT 토큰 가져오기
  const token = await getAuthToken();
  const headers = createAuthHeaders(token);

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/orders/`, {
      method: 'POST',
      headers,
      body: formData,
    }),
    1,  // 1회 재시도
    500 // 500ms 대기
  );

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
}

/**
 * STL 파일 다운로드 URL 생성 - Legacy
 */
export function getDownloadUrl(orderUuid: string): string {
  return `${API_BASE_URL}/api/downloads/${orderUuid}`;
}

/**
 * 내 주문 목록 조회 (로그인한 사용자) - Legacy
 */
export async function fetchMyOrders(token?: string | null): Promise<OrderListItem[]> {
  const headers = createAuthHeaders(token);

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/orders/my-orders`, {
      method: 'GET',
      headers,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to fetch my orders');
  }
  return response.json();
}

/**
 * 주문 목록 조회 (어드민용) - Legacy
 */
export async function fetchOrders(token?: string | null): Promise<OrderListItem[]> {
  const headers = createAuthHeaders(token);

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/orders/list`, {
      method: 'GET',
      headers,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

/**
 * 주문 삭제 (관리자용) - Legacy
 */
export async function deleteOrder(orderUuid: string, token?: string | null): Promise<void> {
  const headers = createAuthHeaders(token);

  const response = await fetch(`${API_BASE_URL}/api/orders/${orderUuid}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to delete order');
  }
}

/**
 * 주문 상태 업데이트 (관리자용) - Legacy
 */
export async function updateOrderStatus(orderUuid: string, status: string, token?: string | null): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const response = await fetch(`${API_BASE_URL}/api/orders/${orderUuid}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
}

/**
 * 내 주문 취소 (고객용, pending 상태만 가능) - Legacy
 */
export async function cancelMyOrder(orderUuid: string, token?: string | null): Promise<void> {
  const headers = createAuthHeaders(token);

  const response = await fetch(`${API_BASE_URL}/api/orders/${orderUuid}/cancel`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to cancel order' }));
    throw new Error(error.detail || 'Failed to cancel order');
  }
}

// ==================== Order Groups API ====================

export interface LineItemData {
  product_sku: string;
  qr_url: string;
  customization: any;
  quantity: number;
  unit_price?: number;  // optional, for validation
  product_type?: string;  // "stand" or "card"
}

export interface OrderGroupResponse {
  group_uuid: string;
  total_price: number;
  line_item_count: number;
  allocation: Record<string, number>;  // 날짜별 배분 결과 {date: quantity}
  message: string;
}

export interface OrderGroupDetail {
  id: number;
  group_uuid: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_postal_code: string;
  customer_address: string;
  delivery_message: string | null;
  status: string;
  payment_id: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  line_items: LineItemDetail[];
}

export interface LineItemDetail {
  id: number;
  line_item_uuid: string;
  product_sku: string;
  qr_url: string;
  customization: any;
  quantity: number;
  unit_price: number;
  total_price: number;
  obj_file_path: string | null;
  mtl_file_path: string | null;
  created_at: string;
}

/**
 * 주문 그룹 생성 (장바구니 전체 제출)
 */
export async function createOrderGroup(
  customerEmail: string,
  customerName: string,
  customerPhone: string,
  customerPostalCode: string,
  customerAddress: string,
  deliveryMessage: string,
  lineItemsData: LineItemData[],
  files: Blob[]  // [obj1, mtl1, obj2, mtl2, ...]
): Promise<OrderGroupResponse> {
  const formData = new FormData();

  // Customer info
  formData.append('customer_email', customerEmail);
  formData.append('customer_name', customerName);
  formData.append('customer_phone', customerPhone);
  formData.append('customer_postal_code', customerPostalCode);
  formData.append('customer_address', customerAddress);
  formData.append('delivery_message', deliveryMessage);

  // Line items (JSON)
  formData.append('line_items_json', JSON.stringify(lineItemsData));

  // Files (OBJ + MTL pairs)
  files.forEach((file, index) => {
    formData.append('files', file, `file_${index}`);
  });

  // Clerk JWT token
  const token = await getAuthToken();
  const headers = createAuthHeaders(token);

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/order-groups/`, {
      method: 'POST',
      headers,
      body: formData,
    }),
    1,
    500
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create order group' }));
    throw new Error(error.detail || 'Failed to create order group');
  }

  return response.json();
}

/**
 * 내 주문 그룹 목록 조회
 */
export async function fetchMyOrderGroups(token?: string | null): Promise<OrderGroupDetail[]> {
  const headers = createAuthHeaders(token);

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/order-groups/my-orders`, {
      method: 'GET',
      headers,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to fetch my order groups');
  }
  return response.json();
}

/**
 * 주문 그룹 상세 조회
 */
export async function fetchOrderGroupDetail(groupUuid: string): Promise<OrderGroupDetail> {
  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/order-groups/${groupUuid}`)
  );

  if (!response.ok) {
    throw new Error('Failed to fetch order group detail');
  }
  return response.json();
}

/**
 * 관리자용 전체 주문 그룹 목록 조회
 */
export async function fetchAllOrderGroups(token?: string | null): Promise<OrderGroupDetail[]> {
  const headers = createAuthHeaders(token);

  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/order-groups/admin/list`, {
      method: 'GET',
      headers,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to fetch all order groups');
  }
  return response.json();
}

/**
 * 주문 그룹 파일 다운로드 URL 가져오기
 */
export function getOrderGroupDownloadUrl(groupUuid: string): string {
  return `${API_BASE_URL}/api/order-groups/${groupUuid}/download`;
}

/**
 * 주문 그룹 상태 업데이트 (관리자용)
 */
export async function updateOrderGroupStatus(groupUuid: string, status: string, token?: string | null): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(token),
  };

  const response = await fetch(`${API_BASE_URL}/api/order-groups/${groupUuid}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to update order group status');
  }
}

/**
 * 주문 그룹 취소 (고객용, pending 상태만 가능)
 */
export async function cancelOrderGroup(groupUuid: string, token?: string | null): Promise<void> {
  const headers = createAuthHeaders(token);

  const response = await fetch(`${API_BASE_URL}/api/order-groups/${groupUuid}/cancel`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to cancel order group' }));
    throw new Error(error.detail || 'Failed to cancel order group');
  }
}

/**
 * 주문 그룹 삭제 (관리자용)
 */
export async function deleteOrderGroup(groupUuid: string, token?: string | null): Promise<void> {
  const headers = createAuthHeaders(token);

  const response = await fetch(`${API_BASE_URL}/api/order-groups/${groupUuid}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to delete order group');
  }
}
