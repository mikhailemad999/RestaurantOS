import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthUser {
  id: string
  email: string
  full_name: string
  phone: string
  avatar: string | null
  role: { id: string; name: string } | null
  branch: { id: string; name: string } | null
  permissions: string[]
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
}

// Load from localStorage
const storedAuth = localStorage.getItem('restaurantos_auth')
const parsed = storedAuth ? JSON.parse(storedAuth) : null

const initialState: AuthState = {
  accessToken: parsed?.accessToken || null,
  refreshToken: parsed?.refreshToken || null,
  user: parsed?.user || null,
  isAuthenticated: !!parsed?.accessToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      access: string
      refresh: string
      user: AuthUser
    }>) => {
      state.accessToken = action.payload.access
      state.refreshToken = action.payload.refresh
      state.user = action.payload.user
      state.isAuthenticated = true

      localStorage.setItem('restaurantos_auth', JSON.stringify({
        accessToken: action.payload.access,
        refreshToken: action.payload.refresh,
        user: action.payload.user,
      }))
    },

    tokenRefreshed: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken
      const stored = localStorage.getItem('restaurantos_auth')
      if (stored) {
        const data = JSON.parse(stored)
        data.accessToken = action.payload.accessToken
        localStorage.setItem('restaurantos_auth', JSON.stringify(data))
      }
    },

    logout: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('restaurantos_auth')
    },

    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const { setCredentials, tokenRefreshed, logout, updateUser } = authSlice.actions
export default authSlice.reducer
