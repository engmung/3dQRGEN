/**
 * API 모듈 통합 re-export
 *
 * 모든 API 함수를 도메인별로 분리된 모듈에서 가져와 재수출합니다.
 */

// ===== Auth =====
export {
  getAuthToken,
  createAuthHeaders,
  apiRequest,
  API_BASE_URL,
} from './auth';

// ===== Orders (Legacy + Order Groups) =====
export type {
  Stand,
  OrderResponse,
  OrderListItem,
  LineItemData,
  OrderGroupResponse,
  OrderGroupDetail,
  LineItemDetail,
} from './orders';

export {
  // Legacy Orders
  fetchStands,
  createOrder,
  getDownloadUrl,
  fetchMyOrders,
  fetchOrders,
  deleteOrder,
  updateOrderStatus,
  cancelMyOrder,
  // Order Groups
  createOrderGroup,
  fetchMyOrderGroups,
  fetchOrderGroupDetail,
  fetchAllOrderGroups,
  getOrderGroupDownloadUrl,
  updateOrderGroupStatus,
  cancelOrderGroup,
  deleteOrderGroup,
} from './orders';

// ===== Pricing =====
export type {
  PricingSettings,
} from './pricing';

export {
  getPricingSettings,
  updatePricingSettings,
} from './pricing';

// ===== Production Schedule =====
export type {
  ProductionScheduleDate,
  ProductionScheduleUpdate,
  ProductionScheduleCreate,
} from './schedule';

export {
  getProductionSchedules,
  getAllProductionSchedules,
  createProductionSchedule,
  updateProductionSchedule,
  disableProductionSchedule,
  getProductionScheduleOrders,
} from './schedule';

// ===== Products =====
export type {
  Product,
} from './products';

export {
  getProducts,
  getProductBySku,
} from './products';

// ===== Legacy Aliases (for backward compatibility) =====
// 기존 코드와의 호환성을 위해 일부 함수명 별칭 제공
export {
  getPricingSettings as fetchPricingSettings,
  getProducts as fetchProducts,
  getProductBySku as fetchProductBySku,
  getProductionSchedules as fetchAvailableDates,
  getAllProductionSchedules as fetchAllProductionSchedule,
  createProductionSchedule as createProductionDate,
  updateProductionSchedule as updateProductionDate,
  disableProductionSchedule as disableProductionDate,
  getProductionScheduleOrders as fetchDateOrders,
} from './index';
