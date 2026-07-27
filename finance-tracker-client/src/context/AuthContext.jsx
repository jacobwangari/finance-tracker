import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser, refreshAccessToken } from '../services/api';
import { setAccessToken, clearAccessToken } from '../services/tokenStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load there's no access token in memory (page reload wipes it), so we
  // silently exchange the httpOnly refresh cookie for a fresh one before checking who's logged in.
  const bootstrap = async () => {
    try {
      const refreshRes = await refreshAccessToken();
      setAccessToken(refreshRes.data.accessToken);
      setUser(refreshRes.data.user);
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await registerUser(data);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  // Used by the GitHub OAuth callback page — access token arrives via URL,
  // refresh cookie was already set server-side during the redirect.
  const setSessionFromOAuth = async (accessToken) => {
    setAccessToken(accessToken);
    const res = await getCurrentUser();
    setUser(res.data.user);
  };

  const logout = async () => {
    await logoutUser();
    clearAccessToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setSessionFromOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);