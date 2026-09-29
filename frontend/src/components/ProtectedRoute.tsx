import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

interface ProtectedRouteProps {
  requiredPermissions?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermissions = [] }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Owner has access to everything
  if (user?.role?.name === 'Owner') {
    return <Outlet />
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const userPermissions = user?.permissions || []
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p))
    if (!hasAll) {
      return (
        <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-white border border-red-200 rounded-xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Access Restricted</h2>
          <p className="text-sm text-gray-600 mb-4">
            You do not have the required permission ({requiredPermissions.join(', ')}) to view this section.
          </p>
        </div>
      )
    }
  }

  return <Outlet />
}
