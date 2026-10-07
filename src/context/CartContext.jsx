import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from '../api/cartApi';

const CartContext = createContext(null);

const emptyCart = { items: [], totalItems: 0, totalAmount: 0 };

// The backend cart is the source of truth.
// This context only keeps the latest copy so the Navbar and pages can show it.
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCart();
      setCart(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the cart when the user logs in, empty it when the user logs out
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(emptyCart);
      setError('');
    }
  }, [isAuthenticated, refreshCart]);

  // Each action calls the backend, then stores the cart the backend sends back.
  // Errors are thrown so the page that called it can show the message.
  const addItem = async (productId, quantity = 1) => {
    const response = await addCartItem(productId, quantity);
    setCart(response.data);
    return response;
  };

  const updateItem = async (productId, quantity) => {
    const response = await updateCartItem(productId, quantity);
    setCart(response.data);
    return response;
  };

  const removeItem = async (productId) => {
    const response = await removeCartItem(productId);
    setCart(response.data);
    return response;
  };

  const emptyTheCart = async () => {
    const response = await clearCart();
    setCart(response.data);
    return response;
  };

  const value = useMemo(
    () => ({ cart, loading, error, refreshCart, addItem, updateItem, removeItem, emptyTheCart }),
    [cart, loading, error, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
};
