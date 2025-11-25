import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { Home } from './pages/Home';
import { HomeDebug } from './pages/HomeDebug';
import { Landing } from './pages/Landing';

function AppContent() {
  const location = useLocation();
  const isEditorPage = location.pathname === '/editor' || location.pathname === '/debug';
  const isLandingPage = location.pathname === '/';
  const [isResourcesLoaded, setIsResourcesLoaded] = useState(false);

  // 리소스(GLB 등) 로딩 상태 - 에디터 페이지에서만 적용
  const isLoading = isEditorPage && !isResourcesLoaded;

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: isEditorPage ? '100vh' : 'auto',
        minHeight: isEditorPage ? 'auto' : '100vh',
        overflow: isEditorPage ? 'hidden' : 'visible'
      }}>
        {!isLandingPage && <Header />}
        <div style={{ flex: 1, overflow: isEditorPage ? 'hidden' : 'visible' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/editor" element={<Home onLoadingComplete={() => setIsResourcesLoaded(true)} />} />
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
