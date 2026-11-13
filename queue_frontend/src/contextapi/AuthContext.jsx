import { createContext, useContext, useMemo, useState } from 'react';
import { clearStoredAuth, getStoredAuth, saveStoredAuth } from '../services/api';
import { loginManager, registerManager } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const persistAuth = (data) => {
    const nextAuth = {
      token: data.token,
      managerId: data.managerId,
      name: data.name,
      email: data.email,
    };

    saveStoredAuth(nextAuth);
    setAuth(nextAuth);
    return nextAuth;
  };

  const login = async ({ email, password }) => {
    const response = await loginManager({ email, password });
    return persistAuth(response.data);
  };

  const register = async ({ name, email, password }) => {
    const response = await registerManager({ name, email, password });
    return persistAuth(response.data);
  };

  const logout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
