import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          ShopHub
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <nav className={menuOpen ? 'navbar-links navbar-links-open' : 'navbar-links'}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={closeMenu}>
            Products
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/orders" onClick={closeMenu}>
                My orders
              </NavLink>
              <NavLink to="/cart" onClick={closeMenu} className="navbar-cart">
                Cart
                {cart.totalItems > 0 && <span className="cart-badge">{cart.totalItems}</span>}
              </NavLink>
              {isStaff && (
                <NavLink to="/admin" onClick={closeMenu}>
                  Manage
                </NavLink>
              )}
              <NavLink to="/profile" onClick={closeMenu}>
                {user.name}
              </NavLink>
              <button className="btn btn-outline btn-sm navbar-logout" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-accent btn-sm" onClick={closeMenu}>
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
