import { baseApi } from './baseApi'

export interface Restaurant {
  id: string
  name: string
  logo: string | null
  phone: string
  email: string
  address: string
  tax_number: string
  currency: string
  timezone: string
  language: string
  receipt_footer: string
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  restaurant: string
  restaurant_name: string
  name: string
  address: string
  phone: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SystemSetting {
  id: string
  branch: string | null
  key: string
  value: string
  category: string
  description: string
}

export const restaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurant: builder.query<{ success: boolean; data: Restaurant }, void>({
      query: () => '/restaurants/profile/',
      providesTags: ['Restaurant'],
    }),

    updateRestaurant: builder.mutation<{ success: boolean; data: Restaurant }, Partial<Restaurant>>({
      query: (body) => ({
        url: '/restaurants/profile/1/', // or custom action / single object
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Restaurant'],
    }),

    getBranches: builder.query<{ success: boolean; data: Branch[] } | Branch[], void>({
      query: () => '/restaurants/branches/',
      providesTags: ['Branches'],
    }),

    createBranch: builder.mutation<Branch, Partial<Branch>>({
      query: (body) => ({
        url: '/restaurants/branches/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Branches'],
    }),

    updateBranch: builder.mutation<Branch, { id: string; data: Partial<Branch> }>({
      query: ({ id, data }) => ({
        url: `/restaurants/branches/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Branches'],
    }),

    deleteBranch: builder.mutation<void, string>({
      query: (id) => ({
        url: `/restaurants/branches/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Branches'],
    }),

    getSettings: builder.query<SystemSetting[], { branch?: string; category?: string } | void>({
      query: (params) => ({
        url: '/restaurants/settings/',
        params: params || {},
      }),
      providesTags: ['Settings'],
    }),

    bulkUpdateSettings: builder.mutation<{ success: boolean; data: SystemSetting[] }, { settings: { branch?: string; key: string; value: string; category?: string }[] }>({
      query: (body) => ({
        url: '/restaurants/settings/bulk_update/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
})

export const {
  useGetRestaurantQuery,
  useUpdateRestaurantMutation,
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetSettingsQuery,
  useBulkUpdateSettingsMutation,
} = restaurantApi
