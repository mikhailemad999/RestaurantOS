import { baseApi } from './baseApi'

export interface SalesSummary {
  period: string
  total_revenue: string
  net_sales: string
  taxes: string
  discounts: string
  service_charges: string
  total_tips: string
  avg_check: string
  total_orders: number
  completed_orders: number
  total_guests: number
  order_type_breakdown: {
    dine_in: number
    takeout: number
    delivery: number
    qr_order: number
  }
}

export interface HourlySale {
  hour: string
  orders: number
  sales: string
}

export interface TopItem {
  item_name: string
  category_name: string
  quantity: number
  sales: string
}

export interface CategoryBreakdown {
  category: string
  quantity: number
  sales: string
}

export interface PaymentMethodBreakdown {
  method: string
  count: number
  amount: string
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesSummary: builder.query<SalesSummary, { period?: string } | void>({
      query: (params) => ({
        url: '/reports/analytics/sales-summary/',
        params: params || { period: 'today' },
      }),
      providesTags: ['Reports'],
    }),
    getHourlySales: builder.query<HourlySale[], { period?: string } | void>({
      query: (params) => ({
        url: '/reports/analytics/hourly-sales/',
        params: params || { period: 'today' },
      }),
      providesTags: ['Reports'],
    }),
    getTopItems: builder.query<TopItem[], { period?: string } | void>({
      query: (params) => ({
        url: '/reports/analytics/top-items/',
        params: params || { period: 'today' },
      }),
      providesTags: ['Reports'],
    }),
    getCategoryBreakdown: builder.query<CategoryBreakdown[], { period?: string } | void>({
      query: (params) => ({
        url: '/reports/analytics/category-breakdown/',
        params: params || { period: 'today' },
      }),
      providesTags: ['Reports'],
    }),
    getPaymentMethods: builder.query<PaymentMethodBreakdown[], { period?: string } | void>({
      query: (params) => ({
        url: '/reports/analytics/payment-methods/',
        params: params || { period: 'today' },
      }),
      providesTags: ['Reports'],
    }),
  }),
})

export const {
  useGetSalesSummaryQuery,
  useGetHourlySalesQuery,
  useGetTopItemsQuery,
  useGetCategoryBreakdownQuery,
  useGetPaymentMethodsQuery,
} = reportsApi
