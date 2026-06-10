// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('expenz_token');
    const savedUser = localStorage.getItem('expenz_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('expenz_token');
        localStorage.removeItem('expenz_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('expenz_token', token);
    localStorage.setItem('expenz_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('expenz_token', token);
    localStorage.setItem('expenz_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('expenz_token');
    localStorage.removeItem('expenz_user');
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const res = await API.put('/auth/profile', data);
    const updatedUser = res.data.user;
    localStorage.setItem('expenz_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};