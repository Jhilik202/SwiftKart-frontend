import { apiClient } from './apiClient';

// All cart routes need a JWT. The backend finds the cart from the token.

// GET /api/cart
export const getCart = () => apiClient.get('/cart');

// POST /api/cart/items  { productId, quantity }
export const addCartItem = (productId, quantity) => apiClient.post('/cart/items', { productId, quantity });

// PUT /api/cart/items/:productId  { quantity }
export const updateCartItem = (productId, quantity) => apiClient.put(`/cart/items/${productId}`, { quantity });

// DELETE /api/cart/items/:productId
export const removeCartItem = (productId) => apiClient.delete(`/cart/items/${productId}`);

// DELETE /api/cart
export const clearCart = () => apiClient.delete('/cart');
