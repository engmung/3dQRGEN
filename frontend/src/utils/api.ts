/**
 * 백엔드 API 클라이언트
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Clerk JWT 토큰을 가져오는 함수
 * 이 함수는 Clerk가 제공하는 window.__clerk_session_token을 사용하거나
 * useAuth hook에서 getToken()을 호출할 수 있습니다.
 */
async function getAuthToken(): Promise<string | null> {
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
 * 주문 생성 (OBJ+MTL 파일 업로드)
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
  plateObjBlob: Blob,
  plateMtlBlob: Blob,
  standObjBlob: Blob,
  standMtlBlob: Blob
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
  formData.append('plate_obj_file', plateObjBlob, 'qr_plate.obj');
  formData.append('plate_mtl_file', plateMtlBlob, 'qr_plate.mtl');
  formData.append('stand_obj_file', standObjBlob, 'stand.obj');
  formData.append('stand_mtl_file', standMtlBlob, 'stand.mtl');

  // Clerk JWT 토큰 가져오기
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}/api/orders/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  // 첫 요청이 403이면 한 번 더 재시도 (JWKS 캐시 로딩 문제)
  if (response.status === 403) {
    console.log('First order request got 403, retrying once...');
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms 대기

    const formData2 = new FormData();
    formData2.append('stand_id', standId.toString());
    formData2.append('stand_name', standName);
    formData2.append('qr_url', qrUrl);
    formData2.append('customization', JSON.stringify(customization));
    formData2.append('customer_email', customerEmail);
    formData2.append('customer_name', customerName);
    formData2.append('customer_phone', customerPhone);
    formData2.append('customer_postal_code', customerPostalCode);
    formData2.append('customer_address', customerAddress);
    formData2.append('delivery_message', deliveryMessage);
    formData2.append('price', price.toString());
    formData2.append('plate_obj_file', plateObjBlob, 'qr_plate.obj');
    formData2.append('plate_mtl_file', plateMtlBlob, 'qr_plate.mtl');
    formData2.append('stand_obj_file', standObjBlob, 'stand.obj');
    formData2.append('stand_mtl_file', standMtlBlob, 'stand.mtl');

    response = await fetch(`${API_BASE_URL}/api/orders/`, {
      method: 'POST',
      headers,
      body: formData2,
    });
  }

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
}

/**
 * STL 파일 다운로드 URL 생성
 */
export function getDownloadUrl(orderUuid: string): string {
  return `${API_BASE_URL}/api/downloads/${orderUuid}`;
}

/**
 * 내 주문 목록 조회 (로그인한 사용자)
 */
export async function fetchMyOrders(token?: string | null): Promise<OrderListItem[]> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
    headers,
  });

  // 첫 요청이 403이면 한 번 더 재시도 (JWKS 캐시 로딩 문제)
  if (response.status === 403) {
    console.log('First fetch my-orders got 403, retrying once...');
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms 대기

    response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
      headers,
    });
  }

  if (!response.ok) {
    throw new Error('Failed to fetch my orders');
  }
  return response.json();
}

/**
 * 주문 목록 조회 (어드민용)
 */
export async function fetchOrders(token?: string | null): Promise<OrderListItem[]> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}/api/orders/list`, {
    headers,
  });

  // 첫 요청이 403이면 한 번 더 재시도 (JWKS 캐시 로딩 문제)
  if (response.status === 403) {
    console.log('First fetch orders got 403, retrying once...');
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms 대기

    response = await fetch(`${API_BASE_URL}/api/orders/list`, {
      headers,
    });
  }

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

/**
 * 주문 삭제 (관리자용)
 */
export async function deleteOrder(orderUuid: string, token?: string | null): Promise<void> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/${orderUuid}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to delete order');
  }
}

/**
 * 주문 상태 업데이트 (관리자용)
 */
export async function updateOrderStatus(orderUuid: string, status: string, token?: string | null): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/${orderUuid}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
}

/**
 * 내 주문 취소 (고객용, pending 상태만 가능)
 */
export async function cancelMyOrder(orderUuid: string, token?: string | null): Promise<void> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/${orderUuid}/cancel`, {
    method: 'PATCH',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to cancel order' }));
    throw new Error(error.detail || 'Failed to cancel order');
  }
}
