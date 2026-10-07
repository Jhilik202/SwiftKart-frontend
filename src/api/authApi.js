import { apiClient } from './apiClient';

// POST /api/auth/register  -> { data: { token, user } }
export const registerUser = (body) => apiClient.post('/auth/register', body, { auth: false });

// POST /api/auth/login  -> { data: { token, user } }
export const loginUser = (body) => apiClient.post('/auth/login', body, { auth: false });

// GET /api/auth/me  (JWT required) -> { data: user }
export const getMe = () => apiClient.get('/auth/me');
