import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic mock initialization for now
    const token = localStorage.getItem('token');
    if (token) {
      // Decode and verify logic would be here
      setUser({ name: 'Test User', role: 'USER' });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // API Call goes here
    setUser({ name: 'Test User', role: 'USER' });
    localStorage.setItem('token', 'mock_token');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
