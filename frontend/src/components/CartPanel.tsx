import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { getQRTypeLabel } from '../utils/qrHelpers';

interface CartPanelProps {
  onDownload: () => void;
}

export const CartPanel = ({ onDownload }: CartPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <>
      {/* Cart toggle button (top right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#FF5252')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FF6B6B')}
      >
        Cart ({items.length})
      </button>

      {/* Cart panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            width: '400px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#2a2a2a',
            border: '2px solid #444',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 199,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '2px solid #444',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1a1a1a',
            }}
          >
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
              Cart ({items.length} items)
            </h3>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all items from cart?')) {
                    clearCart();
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Item list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            {items.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#888',
                  padding: '40px 20px',
                  fontSize: '14px',
                }}
              >
                Cart is empty
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: '#333',
                    borderRadius: '8px',
                    border: '1px solid #444',
                  }}
                >
                  {/* Item number */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#888',
                      marginBottom: '8px',
                    }}
                  >
                    #{index + 1}
                  </div>

                  {/* QR type and colors */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <div
                      style={{
                        flex: 1,
                        fontSize: '13px',
                        color: '#fff',
                        fontWeight: 'bold',
                      }}
                    >
                      QR Type: {getQRTypeLabel(item.plateConfig.qrType)}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: item.plateConfig.plateColor,
                          border: '1px solid #666',
                          borderRadius: '4px',
                        }}
                        title={`Plate color: ${item.plateConfig.plateColor}`}
                      />
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: item.plateConfig.qrColor,
                          border: '1px solid #666',
                          borderRadius: '4px',
                        }}
                        title={`QR color: ${item.plateConfig.qrColor}`}
                      />
                    </div>
                  </div>

                  {/* QR data preview */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#aaa',
                      marginBottom: '8px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.plateConfig.qrType === 'url' && item.plateConfig.qrUrl && (
                      <div>URL: {item.plateConfig.qrUrl.substring(0, 40)}{item.plateConfig.qrUrl.length > 40 ? '...' : ''}</div>
                    )}
                    {item.plateConfig.qrType === 'wifi' && (
                      <div>WiFi: {item.plateConfig.qrWifiData.ssid || '(not set)'}</div>
                    )}
                    {item.plateConfig.qrType === 'email' && (
                      <div>Email: {item.plateConfig.qrEmailData.recipient || '(not set)'}</div>
                    )}
                  </div>

                  {/* Text/Image info */}
                  {((item.plateConfig.texts || []).length > 0 || (item.plateConfig.images || []).length > 0) && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#777',
                        marginBottom: '8px',
                      }}
                    >
                      {(item.plateConfig.texts || []).length > 0 && <div>Text: {(item.plateConfig.texts || [])[0].content.substring(0, 20)}{(item.plateConfig.texts || [])[0].content.length > 20 ? '...' : ''}</div>}
                      {(item.plateConfig.images || []).length > 0 && <div>Image: {(item.plateConfig.images || [])[0].file.name}</div>}
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      backgroundColor: '#555',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#666')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#555')}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bottom download button */}
          {items.length > 0 && (
            <div
              style={{
                padding: '16px 20px',
                borderTop: '2px solid #444',
                backgroundColor: '#1a1a1a',
              }}
            >
              <button
                onClick={onDownload}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
              >
                Download OBJ ({items.length} items)
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
