import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Auto-refresh logic: if 401, try refreshing the token
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState
    const refreshToken = state.auth.refreshToken

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        const data = refreshResult.data as { access: string }
        api.dispatch({
          type: 'auth/tokenRefreshed',
          payload: { accessToken: data.access },
        })
        // Retry original request
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch({ type: 'auth/logout' })
      }
    } else {
      api.dispatch({ type: 'auth/logout' })
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Users', 'Roles', 'Permissions',
    'Restaurant', 'Branches', 'Settings',
    'Categories', 'MenuItems', 'Modifiers',
    'Tables', 'Floors', 'Areas',
    'Orders', 'Payments', 'Shifts',
    'Kitchen', 'Delivery', 'Drivers',
    'Inventory', 'Recipes', 'Suppliers',
    'Customers', 'Reservations', 'Promotions',
    'Reports', 'AuditLogs', 'Notifications',
  ],
  endpoints: () => ({}),
})
