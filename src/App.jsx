import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

// Start every new page at the top
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const staffOnly = ['moderator', 'admin'];
const adminOnly = ['admin'];

const App = () => (
  <div className="app">
    <ScrollToTop />
    <Navbar />

    <main className="app-main">
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Logged-in users */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Moderator and admin */}
        <Route path="/admin" element={<ProtectedRoute roles={staffOnly}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute roles={staffOnly}><AdminProducts /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="/admin/orders" element={<ProtectedRoute roles={adminOnly}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={adminOnly}><AdminUsers /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>

    <Footer />
  </div>
);

export default App;
