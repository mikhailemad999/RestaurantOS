import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const userRole = currentUser?.role;
  const isAuthorized = !allowedRoles || (userRole && allowedRoles.includes(userRole));

  useEffect(() => {
    if (currentUser && !isAuthorized) {
      addToast(`Restricted: Your ${userRole} account cannot access ${location.pathname}. Redirected to your workspace.`, 'warning');
    }
  }, [isAuthorized, currentUser, userRole, location.pathname]);

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAuthorized) {
    const home = currentUser.role_home_path || getRoleHomePath(userRole);
    return <Navigate to={home} replace />;
  }

  return children;
}
