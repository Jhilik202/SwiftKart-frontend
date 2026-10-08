import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  House,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  ShoppingCart,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Avatar from './Avatar';

const ICON_SIZE = 18;

const Navbar = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const cartBadge = cart.totalItems > 0 && <span className="cart-badge">{cart.totalItems}</span>;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          SwiftKart
        </Link>

        <div className="navbar-right">
          {/* On small screens the cart stays visible outside the collapsed menu */}
          {isAuthenticated && (
            <NavLink to="/cart" className="navbar-cart-quick" aria-label="Cart" onClick={closeMenu}>
              <ShoppingCart size={22} aria-hidden="true" />
              {cartBadge}
            </NavLink>
          )}

          <button
            className="navbar-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={ICON_SIZE} aria-hidden="true" /> : <Menu size={ICON_SIZE} aria-hidden="true" />}
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>

        <nav className={menuOpen ? 'navbar-links navbar-links-open' : 'navbar-links'}>
          <NavLink to="/" end onClick={closeMenu}>
            <House size={ICON_SIZE} aria-hidden="true" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/products" onClick={closeMenu}>
            <ShoppingBag size={ICON_SIZE} aria-hidden="true" />
            <span>Products</span>
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/orders" onClick={closeMenu}>
                <Package size={ICON_SIZE} aria-hidden="true" />
                <span>My orders</span>
              </NavLink>
              <NavLink to="/cart" onClick={closeMenu} className="navbar-cart">
                <ShoppingCart size={ICON_SIZE} aria-hidden="true" />
                <span>Cart</span>
                {cartBadge}
              </NavLink>
              {isStaff && (
                <NavLink to="/admin" onClick={closeMenu}>
                  <LayoutDashboard size={ICON_SIZE} aria-hidden="true" />
                  <span>{user.role === 'admin' ? 'Admin' : 'Manage'}</span>
                </NavLink>
              )}
              <NavLink to="/profile" onClick={closeMenu} className="navbar-profile">
                <Avatar user={user} size="sm" />
                <span>Profile</span>
              </NavLink>
              <button className="btn btn-outline btn-sm navbar-logout" onClick={handleLogout}>
                <LogOut size={16} aria-hidden="true" />
                Log out
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                <LogIn size={ICON_SIZE} aria-hidden="true" />
                <span>Log in</span>
              </NavLink>
              <Link to="/register" className="btn btn-accent btn-sm" onClick={closeMenu}>
                <UserPlus size={16} aria-hidden="true" />
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
