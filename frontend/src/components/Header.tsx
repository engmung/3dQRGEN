import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const ADMIN_EMAILS = ['lsh678902@gmail.com'];

export function Header() {
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          3D QR Platform
        </h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{ textDecoration: 'none', color: '#333' }}>홈</a>
          <a href="/designer" style={{ textDecoration: 'none', color: '#333' }}>디자이너</a>
          <SignedIn>
            <a href="/my-orders" style={{ textDecoration: 'none', color: '#333' }}>내 주문</a>
          </SignedIn>
          {isAdmin && (
            <a href="/admin" style={{ textDecoration: 'none', color: '#333' }}>관리자</a>
          )}
        </nav>
      </div>

      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <button style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
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
