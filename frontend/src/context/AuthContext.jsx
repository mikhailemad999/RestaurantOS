import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('restaurantos_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: 'Marcus Vance',
      role: 'ADMIN',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      pin_code: '1234'
    };
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeShift, setActiveShift] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('restaurantos_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('restaurantos_user');
    }
  }, [currentUser]);

  const loginWithPin = async (pin) => {
    try {
      setAuthError('');
      const res = await api.pinLogin(pin);
      if (res.success && res.staff) {
        setCurrentUser(res.staff);
        setIsPinModalOpen(false);
        return true;
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid PIN code');
      return false;
    }
  };

  const switchUser = (staffMember) => {
    setCurrentUser(staffMember);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsPinModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loginWithPin,
      switchUser,
      logout,
      isPinModalOpen,
      setIsPinModalOpen,
      authError,
      setAuthError,
      activeShift,
      setActiveShift
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
