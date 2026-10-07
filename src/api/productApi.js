import { apiClient } from './apiClient';

// GET /api/products?search&category&minPrice&maxPrice&sort&page&limit  (public)
export const getProducts = (params) => apiClient.get('/products', { params, auth: false });

// GET /api/products/:id  (public)
export const getProductById = (id) => apiClient.get(`/products/${id}`, { auth: false });

// POST /api/products  (moderator, admin)
export const createProduct = (body) => apiClient.post('/products', body);

// PUT /api/products/:id  (moderator, admin)
export const updateProduct = (id, body) => apiClient.put(`/products/${id}`, body);

// DELETE /api/products/:id  (admin)
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);
