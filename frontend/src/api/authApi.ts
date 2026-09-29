import { baseApi } from './baseApi'

interface LoginRequest {
  email: string
  password: string
}

interface PinLoginRequest {
  pin_code: string
}

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  avatar: string | null
  role: { id: string; name: string } | null
  branch: { id: string; name: string } | null
  permissions: string[]
}

interface LoginResponse {
  access: string
  refresh: string
  user: User
}

interface MeResponse {
  success: boolean
  data: User & { permissions: string[] }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),

    pinLogin: builder.mutation<{ success: boolean; data: LoginResponse }, PinLoginRequest>({
      query: (body) => ({
        url: '/auth/pin-login/',
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation<void, { refresh: string }>({
      query: (body) => ({
        url: '/auth/logout/',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me/',
    }),

    changePassword: builder.mutation<void, { old_password: string; new_password: string }>({
      query: (body) => ({
        url: '/auth/change-password/',
        method: 'POST',
        body,
      }),
    }),

    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password/',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  usePinLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
} = authApi
