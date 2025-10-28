import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { Home } from './pages/Home';
import { HomeDebug } from './pages/HomeDebug';
import { Admin } from './pages/Admin';
import { MyOrders } from './pages/MyOrders';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/debug';
  const { isLoaded: isClerkLoaded } = useUser();
  const [isResourcesLoaded, setIsResourcesLoaded] = useState(false);

  // 전체 로딩 상태: Clerk + 리소스(GLB 등)
  const isLoading = !isClerkLoaded || !isResourcesLoaded;

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: isHomePage ? '100vh' : 'auto',
        minHeight: isHomePage ? 'auto' : '100vh',
        overflow: isHomePage ? 'hidden' : 'visible'
      }}>
        <Header />
        <div style={{ flex: 1, overflow: isHomePage ? 'hidden' : 'visible' }}>
          <Routes>
            <Route path="/" element={<Home onLoadingComplete={() => setIsResourcesLoaded(true)} />} />
            <Route path="/debug" element={<HomeDebug onLoadingComplete={() => setIsResourcesLoaded(true)} />} />
            <Route path="/admin" element={<Admin onLoadingComplete={() => setIsResourcesLoaded(true)} />} />
            <Route path="/my-orders" element={<MyOrders onLoadingComplete={() => setIsResourcesLoaded(true)} />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
