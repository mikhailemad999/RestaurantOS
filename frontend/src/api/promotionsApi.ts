import { baseApi } from './baseApi'

export interface Promotion {
  id: string
  name: string
  code: string
  description: string
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO'
  discount_value: string
  min_order_amount: string
  max_discount_amount: string | null
  start_date: string
  end_date: string | null
  usage_limit: number
  times_used: number
  is_active: boolean
  applicable_order_types: 'ALL' | 'DINE_IN' | 'TAKEOUT' | 'DELIVERY'
  branch: string | null
  branch_name: string | null
  is_valid_now: boolean
  created_at: string
}

export interface ValidatePromoResponse {
  valid: boolean
  code?: string
  name?: string
  discount_type?: string
  discount_value?: string
  discount_amount?: string
  final_amount?: string
  message: string
}

export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<Promotion[], { active?: boolean } | void>({
      query: (params) => ({
        url: '/promotions/coupons/',
        params: params || {},
      }),
      providesTags: ['Promotions'],
    }),
    createPromotion: builder.mutation<Promotion, Partial<Promotion>>({
      query: (body) => ({
        url: '/promotions/coupons/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promotions'],
    }),
    updatePromotion: builder.mutation<Promotion, { id: string } & Partial<Promotion>>({
      query: ({ id, ...body }) => ({
        url: `/promotions/coupons/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Promotions'],
    }),
    deletePromotion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/promotions/coupons/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Promotions'],
    }),
    validatePromo: builder.mutation<ValidatePromoResponse, { code: string; order_amount: number; order_type?: string }>({
      query: (body) => ({
        url: '/promotions/coupons/validate/',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useValidatePromoMutation,
} = promotionsApi
