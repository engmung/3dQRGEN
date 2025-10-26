import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { HomeDebug } from './pages/HomeDebug';
import { Admin } from './pages/Admin';
import { MyOrders } from './pages/MyOrders';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/debug';

  return (
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
          <Route path="/" element={<Home />} />
          <Route path="/debug" element={<HomeDebug />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </div>
    </div>
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
