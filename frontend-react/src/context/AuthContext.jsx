import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../api';

const AuthCtx = createContext(null);
export function useAuth(){ return useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const [token,setToken] = useState(()=> localStorage.getItem('token'));

  useEffect(()=> {
    if(token){
      setAuthToken(token);
      api.auth.me().then(u=> setUser(u)).catch(()=> {
        setToken(null); setAuthToken(null); localStorage.removeItem('token');
      });
    }
  }, [token]);

  const login = async (correo, contrasena) => {
    setLoading(true);
    setError(null);
    try {
      const t = await api.auth.login({ correo, contrasena });
      setToken(t.access_token); localStorage.setItem('token', t.access_token); setAuthToken(t.access_token);
      const u = await api.auth.me(); setUser(u);
    } catch(err) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally { setLoading(false); }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.register(payload);
      await login(payload.correo, payload.contrasena);
    } catch(err) {
      setError(err.message || 'Error al registrar');
      throw err;
    } finally { setLoading(false); }
  };

  const logout = () => {
    setUser(null); setToken(null); setAuthToken(null); localStorage.removeItem('token');
  };

  return <AuthCtx.Provider value={{ user, token, loading, error, login, register, logout }}>
    {children}
  </AuthCtx.Provider>;
}
