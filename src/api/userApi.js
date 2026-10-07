import { apiClient } from './apiClient';

// All user management routes are admin only.

// GET /api/users?role&page&limit
export const getUsers = (params) => apiClient.get('/users', { params });

// PUT /api/users/:id  { name?, email?, role?, password? }
export const updateUser = (id, body) => apiClient.put(`/users/${id}`, body);

// DELETE /api/users/:id
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
