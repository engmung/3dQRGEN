import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { Home } from './pages/Home';
import { HomeDebug } from './pages/HomeDebug';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/debug';
  const [isResourcesLoaded, setIsResourcesLoaded] = useState(false);

  // 리소스(GLB 등) 로딩 상태
  const isLoading = !isResourcesLoaded;

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
            {/* Debug mode: manually navigate to /debug */}
            <Route path="/debug" element={<HomeDebug onLoadingComplete={() => setIsResourcesLoaded(true)} />} />
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
