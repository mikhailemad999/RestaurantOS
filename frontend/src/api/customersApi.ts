import { baseApi } from './baseApi'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  loyalty_points: number
  total_spent: string
  total_visits: number
  favorite_dish: string
  notes: string
  created_at: string
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], void>({
      query: () => '/customers/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Customers'],
    }),

    addLoyaltyPoints: builder.mutation<{ success: boolean; loyalty_points: number }, { id: string; points: number }>({
      query: ({ id, points }) => ({
        url: `/customers/${id}/add-points/`,
        method: 'POST',
        body: { points },
      }),
      invalidatesTags: ['Customers'],
    }),

    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (body) => ({
        url: '/customers/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customers'],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useAddLoyaltyPointsMutation,
  useCreateCustomerMutation,
} = customersApi
