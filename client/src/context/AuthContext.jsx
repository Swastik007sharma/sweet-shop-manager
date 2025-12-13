import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null); 

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Mock user object for isAuthenticated check
      setUser({ role: 'user' }); 
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = (userData) => {
    setToken(userData.token);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);