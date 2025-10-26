import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const ADMIN_EMAILS = ['lsh678902@gmail.com'];

export function Header() {
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  // 현재 경로 확인
  const currentPath = window.location.pathname;

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 1.5rem',
      backgroundColor: '#f5f3f0',
      borderBottom: '1px solid #e5e0db',
      height: '50px',
      minHeight: '50px',
      maxHeight: '50px',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>
          3D QR DESIGNER
        </h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{
            textDecoration: 'none',
            color: currentPath === '/' ? '#000' : '#666',
            fontSize: '18px',
            fontWeight: currentPath === '/' ? 600 : 400
          }}>홈</a>
          <a href="/debug" style={{
            textDecoration: 'none',
            color: currentPath === '/debug' ? '#000' : '#666',
            fontSize: '18px',
            fontWeight: currentPath === '/debug' ? 600 : 400
          }}>디버그</a>
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
    </header>
  );
}
