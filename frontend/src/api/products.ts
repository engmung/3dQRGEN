/**
 * 제품 관련 API
 */

import { fetchWithRetry } from '../utils/fetchWithRetry';
import { API_BASE_URL } from './auth';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
}

/**
 * 제품 목록 조회
 */
export async function getProducts(category?: string): Promise<Product[]> {
  const url = category
    ? `${API_BASE_URL}/api/products?category=${category}`
    : `${API_BASE_URL}/api/products`;

  const response = await fetchWithRetry(() => fetch(url));

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

/**
 * SKU로 제품 조회
 */
export async function getProductBySku(sku: string): Promise<Product> {
  const response = await fetchWithRetry(
    () => fetch(`${API_BASE_URL}/api/products/${sku}`)
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${sku}`);
  }
  return response.json();
}
