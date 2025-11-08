/**
 * Admin Page - Main Component
 * Manages pricing, colors, production calendar, and orders
 * Refactored into modular components (2025-01-26)
 */

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { fetchAllOrderGroups, type OrderGroupDetail, type PricingSettings } from '../../utils/api';
import { getPricingSettings } from '../../utils/pricing';
import { ProductionCalendar } from '../ProductionCalendar';
import { PricingSettingsPanel } from './PricingSettings';
import { ColorSettings } from './ColorSettings';
import { OrderManagement } from './OrderManagement';
import { useIsMobile } from '../../hooks/useMediaQuery';

const ADMIN_EMAILS = ['lsh678902@gmail.com'];

interface AdminProps {
  onLoadingComplete?: () => void;
}

export function Admin({ onLoadingComplete }: AdminProps = {}) {
  const isMobile = useIsMobile();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  // State
  const [orderGroups, setOrderGroups] = useState<OrderGroupDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);
  const [editingPricing, setEditingPricing] = useState(false);
  const [newPricing, setNewPricing] = useState<PricingSettings>({
    base_price: 20000,
    text_price: 5000,
    image_price: 5000,
    announcement_message: '',
  });

  const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  // Load order groups
  const loadOrderGroups = async () => {
    try {
      const token = await getToken();
      const data = await fetchAllOrderGroups(token);
      setOrderGroups(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load order groups:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Load pricing settings
  const loadPricingSettings = async () => {
    try {
      const settings = await getPricingSettings();
      setPricingSettings(settings);
      setNewPricing(settings);
    } catch (err) {
      console.error('Failed to load pricing settings:', err);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadOrderGroups();
    loadPricingSettings();
  }, [isLoaded, isAdmin]);

  // Page loading complete callback
  useEffect(() => {
    if (!loading && onLoadingComplete) {
      onLoadingComplete();
    }
  }, [loading, onLoadingComplete]);

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>로딩 중...</h2>
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>접근 거부</h2>
        <p>관리자만 접근할 수 있습니다.</p>
        <a href="/" style={{ color: '#4CAF50', textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>오류 발생</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '15px' : '40px',
      overflow: isMobile ? 'auto' : 'visible',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: isMobile ? '20px' : '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: isMobile ? '20px' : '32px'
        }}>관리자 페이지</h1>
        <a href="/" style={{
          textDecoration: 'none',
          color: '#4CAF50',
          fontSize: isMobile ? '14px' : '16px'
        }}>홈으로</a>
      </div>

      {/* Pricing Settings */}
      <PricingSettingsPanel
        pricingSettings={pricingSettings}
        onUpdate={(settings) => {
          setPricingSettings(settings);
          setNewPricing(settings);
        }}
        onEditingChange={setEditingPricing}
      />

      {/* Color Settings (shown only when editing pricing) */}
      {editingPricing && (
        <ColorSettings
          pricingSettings={newPricing}
          onChange={setNewPricing}
        />
      )}

      {/* Production Calendar */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '2px solid #2196F3'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>생산 일정 관리</h2>
        <ProductionCalendar onReload={loadOrderGroups} />
      </div>

      {/* Order Management */}
      <OrderManagement
        orderGroups={orderGroups}
        onReload={loadOrderGroups}
      />
    </div>
  );
}
