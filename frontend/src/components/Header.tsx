import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * Header Component
 * Header with navigation between landing and editor pages
 *
 * Debug mode: Manually navigate to /debug to access developer tools
 */
export function Header() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';
  const isEditorPage = location.pathname === '/editor' || location.pathname === '/debug';

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '0.5rem 1rem' : '0.5rem 1.5rem',
      backgroundColor: '#f5f3f0',
      borderBottom: '1px solid #e5e0db',
      height: '50px',
      minHeight: '50px',
      maxHeight: '50px',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      <h1
        style={{
          margin: 0,
          fontSize: isMobile ? '20px' : '28px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        3D QR DESIGNER
      </h1>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {isEditorPage && (
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#333',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e0db')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Introduction
          </button>
        )}
        {isLandingPage && (
          <button
            onClick={() => navigate('/editor')}
            style={{
              background: '#FF6B6B',
              border: 'none',
              color: '#fff',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FF5252')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B6B')}
          >
            Start Design
          </button>
        )}
      </nav>

      {/* Debug link (commented out - manually type /debug in URL to access) */}
      {/* <a href="/debug">Debug</a> */}
    </header>
  );
}
