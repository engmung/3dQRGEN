import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useIsMobile } from '../hooks/useMediaQuery';

const ADMIN_EMAILS = ['lsh678902@gmail.com'];

export function Header() {
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 현재 경로 확인
  const currentPath = window.location.pathname;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '1rem' : '2rem' }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: 700 }}>
          3D QR DESIGNER
        </h1>

        {/* 데스크톱 네비게이션 */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{
            textDecoration: 'none',
            color: currentPath === '/' ? '#000' : '#666',
            fontSize: '18px',
            fontWeight: currentPath === '/' ? 600 : 400
          }}>홈</a>
          {isAdmin && (
            <a href="/debug" style={{
              textDecoration: 'none',
              color: currentPath === '/debug' ? '#000' : '#666',
              fontSize: '18px',
              fontWeight: currentPath === '/debug' ? 600 : 400
            }}>디버그</a>
          )}
          <SignedIn>
            <a href="/my-orders" style={{
              textDecoration: 'none',
              color: currentPath === '/my-orders' ? '#000' : '#666',
              fontSize: '18px',
              fontWeight: currentPath === '/my-orders' ? 600 : 400
            }}>내 주문</a>
          </SignedIn>
          {isAdmin && (
            <a href="/admin" style={{
              textDecoration: 'none',
              color: currentPath === '/admin' ? '#000' : '#666',
              fontSize: '18px',
              fontWeight: currentPath === '/admin' ? 600 : 400
            }}>관리자</a>
          )}
          </nav>
        )}

        {/* 모바일 햄버거 버튼 */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <button style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              outline: 'none',
            }}>
              로그인
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: {
                  width: '40px',
                  height: '40px',
                }
              }
            }}
          />
        </SignedIn>
      </div>

      {/* 모바일 드로어 메뉴 */}
      {isMobile && isMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e0db',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <a
              href="/"
              onClick={() => setIsMenuOpen(false)}
              style={{
                padding: '16px 20px',
                textDecoration: 'none',
                color: currentPath === '/' ? '#000' : '#666',
                fontSize: '16px',
                fontWeight: currentPath === '/' ? 600 : 400,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              홈
            </a>
            {isAdmin && (
              <a
                href="/debug"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: currentPath === '/debug' ? '#000' : '#666',
                  fontSize: '16px',
                  fontWeight: currentPath === '/debug' ? 600 : 400,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                디버그
              </a>
            )}
            <SignedIn>
              <a
                href="/my-orders"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: currentPath === '/my-orders' ? '#000' : '#666',
                  fontSize: '16px',
                  fontWeight: currentPath === '/my-orders' ? 600 : 400,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                내 주문
              </a>
            </SignedIn>
            {isAdmin && (
              <a
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: currentPath === '/admin' ? '#000' : '#666',
                  fontSize: '16px',
                  fontWeight: currentPath === '/admin' ? 600 : 400,
                }}
              >
                관리자
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
