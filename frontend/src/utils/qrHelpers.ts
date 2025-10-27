/**
 * QR type utility functions
 * Consolidates duplicate logic from OrderModal.tsx and CartPanel.tsx
 */

export function getQRTypeLabel(qrType: string): string {
  const labels: Record<string, string> = {
    url: 'URL',
    wifi: 'WiFi',
    email: 'Email',
  };
  return labels[qrType] || qrType;
}
