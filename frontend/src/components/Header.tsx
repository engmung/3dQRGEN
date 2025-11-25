import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * Header Component
 * Simple header with logo only
 *
 * Debug mode: Manually navigate to /debug to access developer tools
 */
export function Header() {
  const isMobile = useIsMobile();

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
      <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: 700 }}>
        3D QR DESIGNER
      </h1>

      {/* Debug link (commented out - manually type /debug in URL to access) */}
      {/* <a href="/debug">Debug</a> */}
    </header>
  );
}
