import React, { createContext, useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../utils/socket';

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Initialize loading based on whether we have a potential session to check
  const [loading, setLoading] = useState(() => {
    const hasToken = sessionStorage.getItem('token');
    const hasUser = sessionStorage.getItem('user');
    return !!(hasToken && hasUser);
  });

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    
    console.log("AuthProvider: Initial check", { hasToken: !!token, hasUser: !!storedUser });

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        connectSocket(parsedUser);
        console.log("AuthProvider: Session restored", parsedUser.role);
      } catch (error) {
        console.error("AuthProvider: Failed to parse stored user", error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password, token, userData) => {
    console.log("AuthProvider: Executing login for", userData.role);
    
    // Set storage FIRST to ensure it's there if a re-mount happens
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    connectSocket(userData);
    setLoading(false);
    
    console.log("AuthProvider: Login state updated");
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    disconnectSocket();
    setLoading(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>

      {children}
    </AuthContext.Provider>
  );
};
