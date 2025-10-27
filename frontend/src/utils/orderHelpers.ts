/**
 * Order status utility functions
 * Consolidates duplicate logic from Admin.tsx and MyOrders.tsx
 */

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '입금 대기',
    paid: '입금 완료',
    in_production: '제작 중',
    shipped: '배송 중',
    completed: '배송 완료',
    failed: '취소됨',
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: '#ffc107',           // 노란색 - 입금 대기
    paid: '#17a2b8',              // 청록색 - 입금 완료
    in_production: '#fd7e14',     // 주황색 - 제작 중
    shipped: '#007bff',           // 파란색 - 배송 중
    completed: '#28a745',         // 초록색 - 배송 완료
    failed: '#dc3545',            // 빨간색 - 취소됨
  };
  return colorMap[status] || '#6c757d';
}
