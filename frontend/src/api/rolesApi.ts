import { baseApi } from './baseApi'

export interface Permission {
  id: string
  codename: string
  name: string
  module: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description: string
  is_system: boolean
  is_custom: boolean
  permissions: Permission[]
  user_count: number
  created_at: string
  updated_at: string
}

interface RoleCreateRequest {
  name: string
  description?: string
  permission_ids?: string[]
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => '/roles/',
      transformResponse: (response: any) => Array.isArray(response) ? response : (response?.data || []),
      providesTags: ['Roles'],
    }),

    getRole: builder.query<Role, string>({
      query: (id) => `/roles/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
    }),

    createRole: builder.mutation<Role, RoleCreateRequest>({
      query: (body) => ({
        url: '/roles/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),

    updateRole: builder.mutation<Role, { id: string; data: Partial<RoleCreateRequest> }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/roles/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    getPermissions: builder.query<{ success: boolean; data: { permissions: Permission[]; grouped: Record<string, Permission[]> } }, void>({
      query: () => '/permissions/',
      providesTags: ['Permissions'],
    }),
  }),
})

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
} = rolesApi
