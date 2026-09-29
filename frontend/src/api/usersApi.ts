import { baseApi } from './baseApi'

export interface User {
  id: string
  email: string
  phone: string
  full_name: string
  avatar: string | null
  pin_code?: string
  role: { id: string; name: string } | null
  branch: string | null
  branch_name: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

interface UserCreateRequest {
  email: string
  phone?: string
  full_name: string
  password: string
  pin_code?: string
  role_id: string
  branch?: string
  is_active?: boolean
}

interface UserUpdateRequest {
  email?: string
  phone?: string
  full_name?: string
  pin_code?: string
  role_id?: string
  branch?: string
  is_active?: boolean
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    count: number
    page: number
    page_size: number
    total_pages: number
    next: string | null
    previous: string | null
  }
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, { page?: number; search?: string; role?: string }>({
      query: (params) => ({
        url: '/users/',
        params,
      }),
      providesTags: ['Users'],
    }),

    getUser: builder.query<{ success: boolean; data: User }, string>({
      query: (id) => `/users/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    createUser: builder.mutation<{ success: boolean; data: User; message: string }, UserCreateRequest>({
      query: (body) => ({
        url: '/users/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<{ success: boolean; data: User; message: string }, { id: string; data: UserUpdateRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    toggleUserActive: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/toggle_active/`,
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserActiveMutation,
} = usersApi
