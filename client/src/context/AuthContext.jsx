import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on reload
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Verify token validity by calling profile API
          const { data } = await API.get('/auth/profile');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          console.error('Failed to verify token on boot:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      
      const userProfile = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password, role });
      
      localStorage.setItem('token', data.token);
      
      const userProfile = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
