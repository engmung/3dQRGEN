import { useIsMobile } from '../hooks/useMediaQuery';

export const LoadingScreen = () => {
  const isMobile = useIsMobile();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      {/* 로딩 스피너 */}
      <div style={{
        width: isMobile ? '60px' : '80px',
        height: isMobile ? '60px' : '80px',
        border: '6px solid rgba(0, 0, 0, 0.1)',
        borderTop: '6px solid #333333',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />

      {/* 로딩 텍스트 */}
      <div style={{
        marginTop: '30px',
        fontSize: isMobile ? '18px' : '24px',
        fontWeight: 600,
        color: '#333333',
        textAlign: 'center',
        padding: '0 20px',
      }}>
        3D QR 플랫폼 로딩 중...
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
