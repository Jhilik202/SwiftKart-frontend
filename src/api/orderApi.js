import { apiClient } from './apiClient';

// POST /api/orders  { shippingAddress, paymentMethod, items? }
// Without "items" the backend orders everything in the user's cart.
export const createOrder = (body) => apiClient.post('/orders', body);

// GET /api/orders?page&limit  (own orders)
export const getMyOrders = (params) => apiClient.get('/orders', { params });

// GET /api/orders/all?orderStatus&paymentStatus&page&limit  (admin)
export const getAllOrders = (params) => apiClient.get('/orders/all', { params });

// GET /api/orders/:id  (owner or admin)
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);

// PUT /api/orders/:id/status  { orderStatus?, paymentStatus? }  (admin)
export const updateOrderStatus = (id, body) => apiClient.put(`/orders/${id}/status`, body);
