import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const ROLE_HOME_MAP = {
  ADMIN: '/owner',
  MANAGER: '/manager',
  CASHIER: '/cashier',
  WAITER: '/captain',
  CHEF: '/chef',
  DRIVER: '/driver',
  PACKING: '/packing',
  INVENTORY: '/inventory',
  CALL_CENTER: '/call-center',
};

export const getRoleHomePath = (role) => {
  return ROLE_HOME_MAP[role] || '/command-center';
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('restaurantos_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: 'Marcus Vance',
      role: 'ADMIN',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      pin_code: '9999',
      role_home_path: '/owner',
      workspace: 'ADMIN_WORKSPACE'
    };
  });

  const [roleAccounts, setRoleAccounts] = useState([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeShift, setActiveShift] = useState(null);

  useEffect(() => {
    loadRoleAccounts();
  }, []);

  const loadRoleAccounts = async () => {
    try {
      const accounts = await api.getRoleAccounts();
      if (Array.isArray(accounts) && accounts.length > 0) {
        setRoleAccounts(accounts);
      }
    } catch (e) {
      console.warn('Could not preload role accounts from server:', e);
    }
  };

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
        const enriched = {
          ...res.staff,
          role_home_path: res.staff.role_home_path || getRoleHomePath(res.staff.role),
          workspace: res.staff.workspace || `${res.staff.role}_WORKSPACE`
        };
        setCurrentUser(enriched);
        setIsPinModalOpen(false);
        return enriched;
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid PIN code');
      return null;
    }
  };

  const switchUser = (staffMember) => {
    const enriched = {
      ...staffMember,
      role_home_path: staffMember.role_home_path || getRoleHomePath(staffMember.role),
      workspace: staffMember.workspace || `${staffMember.role}_WORKSPACE`
    };
    setCurrentUser(enriched);
  };

  const switchByRole = (roleKey) => {
    const target = roleAccounts.find(a => a.role === roleKey);
    if (target) {
      switchUser(target);
      return target;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsPinModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      roleAccounts,
      loginWithPin,
      switchUser,
      switchByRole,
      logout,
      isPinModalOpen,
      setIsPinModalOpen,
      authError,
      setAuthError,
      activeShift,
      setActiveShift,
      getRoleHomePath
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
