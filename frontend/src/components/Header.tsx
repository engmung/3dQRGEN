import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useIsMobile } from '../hooks/useMediaQuery';

const ADMIN_EMAILS = ['lsh678902@gmail.com'];

export function Header() {
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check current path
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
        {/* Mobile hamburger button */}
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

        <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: 700 }}>
          3D QR DESIGNER
        </h1>

        {/* Desktop navigation */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{
            textDecoration: 'none',
            color: currentPath === '/' ? '#000' : '#666',
            fontSize: '18px',
            fontWeight: currentPath === '/' ? 600 : 400
          }}>Home</a>
          {isAdmin && (
            <a href="/debug" style={{
              textDecoration: 'none',
              color: currentPath === '/debug' ? '#000' : '#666',
              fontSize: '18px',
              fontWeight: currentPath === '/debug' ? 600 : 400
            }}>Debug</a>
          )}
          {isAdmin && (
            <a href="/admin" style={{
              textDecoration: 'none',
              color: currentPath === '/admin' ? '#000' : '#666',
              fontSize: '18px',
              fontWeight: currentPath === '/admin' ? 600 : 400
            }}>Admin</a>
          )}
          </nav>
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
              Sign In
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

      {/* Mobile drawer menu */}
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
              Home
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
                Debug
              </a>
            )}
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
                Admin
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
