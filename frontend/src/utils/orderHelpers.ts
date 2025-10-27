/**
 * Order status utility functions
 * Consolidates duplicate logic from Admin.tsx and MyOrders.tsx
 */

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '입금 대기',
    paid: '입금 완료',
    completed: '배송 완료',
    failed: '취소됨',
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: '#ffc107',
    paid: '#28a745',
    completed: '#007bff',
    failed: '#dc3545',
  };
  return colorMap[status] || '#6c757d';
}
