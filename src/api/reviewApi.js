import { apiClient } from './apiClient';

// GET /api/products/:productId/reviews?page&limit  (public)
export const getReviews = (productId, params) =>
  apiClient.get(`/products/${productId}/reviews`, { params, auth: false });

// POST /api/products/:productId/reviews  { rating, comment }
export const createReview = (productId, body) => apiClient.post(`/products/${productId}/reviews`, body);

// PUT /api/products/:productId/reviews/:reviewId  { rating?, comment? }  (owner)
export const updateReview = (productId, reviewId, body) =>
  apiClient.put(`/products/${productId}/reviews/${reviewId}`, body);

// DELETE /api/products/:productId/reviews/:reviewId  (owner)
export const deleteReview = (productId, reviewId) =>
  apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
