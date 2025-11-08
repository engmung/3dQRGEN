/**
 * Admin Page - Entry Point
 * Re-exports the refactored Admin component for backward compatibility
 *
 * Original file (1,325 lines) has been refactored into modular components:
 * - components/admin/OrderManagement.tsx (~600 lines)
 * - components/admin/PricingSettings.tsx (~150 lines)
 * - components/admin/ColorSettings.tsx (~200 lines)
 * - components/admin/OrderDetailModal.tsx (shared with MyOrders)
 * - components/admin/index.tsx (~150 lines)
 *
 * Total reduction: 1,325 lines → 150 lines in main component
 * Refactored: 2025-01-26
 */

export { Admin } from '../components/admin';
