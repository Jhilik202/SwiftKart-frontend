import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getToken, setToken, setUnauthorizedHandler } from '../api/apiClient';
import { getMe, loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Only "loading" when a saved token has to be checked with the backend
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // If any request gets 401 (expired or invalid token) the user is logged out
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // On first load: if a token is saved, ask the backend who the user is
  useEffect(() => {
    if (!getToken()) return undefined;

    let cancelled = false;

    getMe()
      .then((response) => {
        if (!cancelled) setUser(response.data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (name, email, password) => {
    const response = await registerUser({ name, email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      role: user ? user.role : null,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'admin' || user?.role === 'moderator',
      login,
      register,
      logout,
      updateCurrentUser: setUser,
    }),
    [user, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
