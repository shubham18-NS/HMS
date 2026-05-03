import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hms_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(({ data }) => {
        setUser(data.user);
        setProfile(data.profile || null);
      })
      .catch(() => {
        localStorage.removeItem('hms_token');
        setToken(null);
        setUser(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (values) => {
    const { data } = await authApi.login(values);
    localStorage.setItem('hms_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile || null);
    return data;
  };

  const register = async (values) => {
    const { data } = await authApi.register(values);
    localStorage.setItem('hms_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile || null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({ user, profile, token, loading, login, register, logout, setUser, setProfile }),
    [user, profile, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
