// The only place that knows the backend URL and how to send requests.
// Change VITE_API_URL in .env to point to another backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'ecommerce_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// AuthContext registers a function here so an expired token logs the user out
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const buildQueryString = (params) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : '';
};

const request = async (path, { method = 'GET', body, params, auth = true } = {}) => {
  const url = `${API_URL}${path}${buildQueryString(params)}`;

  const headers = {};
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  // JSON for normal requests. For file uploads (FormData) the browser sets the multipart header itself.
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError('Cannot reach the server. Check that the backend is running and VITE_API_URL is correct.', 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    // Backend errors look like { success: false, error: "message" }
    const message = (data && data.error) || `Request failed with status ${response.status}`;

    if (response.status === 401 && auth && token && unauthorizedHandler) {
      unauthorizedHandler();
    }

    throw new ApiError(message, response.status);
  }

  return data;
};

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
