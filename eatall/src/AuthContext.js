// Archivo para gestionar AuthContext y guardar el estado del usuario
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ isAuthenticated: false, UsuarioID: null });

  const login = (UsuarioID) => {
    console.log('Login con UsuarioID:', UsuarioID);
    setAuth({ isAuthenticated: true, UsuarioID });
  };
  
  const logout = () => {
    setAuth({ isAuthenticated: false, UsuarioID: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
