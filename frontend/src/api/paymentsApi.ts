import { baseApi } from './baseApi'

export interface PaymentTransaction {
  id: string
  order: string
  order_number: string
  table_number: string | null
  customer_name: string
  shift: string | null
  payment_method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'DIGITAL_WALLET' | 'CUSTOMER_BALANCE'
  amount: string
  tip_amount: string
  status: 'COMPLETED' | 'REFUNDED' | 'FAILED'
  transaction_id: string
  receipt_number: string
  card_last_four: string
  processed_by_name: string | null
  notes: string
  created_at: string
}

export interface CashDrawerShift {
  id: string
  shift_number: string
  user: number
  user_name: string
  branch: string | null
  branch_name: string | null
  opening_float: string
  closing_float: string | null
  expected_cash: string
  actual_cash: string | null
  cash_difference: string
  total_card_sales: string
  total_wallet_sales: string
  total_cash_sales: string
  total_tips: string
  status: 'OPEN' | 'CLOSED'
  opened_at: string
  closed_at: string | null
  notes: string
  payments_count: number
}

export interface ReceiptData {
  restaurant_name: string
  branch_name: string
  branch_address: string
  branch_phone: string
  order_number: string
  table_number: string
  server_name: string
  order_type: string
  subtotal: string
  tax_amount: string
  discount_amount: string
  service_charge: string
  total_amount: string
  payments: Array<{
    method: string
    amount: string
    tip: string
    receipt_number: string
    transaction_id: string
    card_last_four: string
    date: string
  }>
  items: Array<{
    name: string
    variant: string | null
    quantity: number
    unit_price: string
    total_price: string
  }>
  created_at: string
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<PaymentTransaction[], { order_id?: string; shift_id?: string; method?: string } | void>({
      query: (params) => ({
        url: '/payments/transactions/',
        params: params || {},
      }),
      providesTags: ['Payments'],
    }),
    getShifts: builder.query<CashDrawerShift[], { status?: string } | void>({
      query: (params) => ({
        url: '/payments/shifts/',
        params: params || {},
      }),
      providesTags: ['Shifts'],
    }),
    getCurrentShift: builder.query<{ has_open_shift: boolean; data: CashDrawerShift | null }, void>({
      query: () => '/payments/shifts/current/',
      providesTags: ['Shifts'],
    }),
    openShift: builder.mutation<{ success: boolean; data: CashDrawerShift }, { opening_float: number; notes?: string }>({
      query: (body) => ({
        url: '/payments/shifts/open/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shifts'],
    }),
    closeShift: builder.mutation<{ success: boolean; data: CashDrawerShift }, { id: string; actual_cash: number; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/payments/shifts/${id}/close/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shifts'],
    }),
    processPayment: builder.mutation<
      { success: boolean; message: string; payment: PaymentTransaction; order_payment_status: string },
      { order_id: string; payment_method: string; amount: number; tip_amount?: number; card_last_four?: string; notes?: string }
    >({
      query: (body) => ({
        url: '/payments/transactions/process/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payments', 'Orders', 'Shifts', 'Tables'],
    }),
    refundPayment: builder.mutation<{ success: boolean; payment: PaymentTransaction }, { id: string; reason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/payments/transactions/${id}/refund/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payments', 'Orders', 'Shifts'],
    }),
    getReceipt: builder.query<ReceiptData, { order_id?: string; payment_id?: string }>({
      query: (params) => ({
        url: '/payments/transactions/receipt/',
        params,
      }),
    }),
  }),
})

export const {
  useGetTransactionsQuery,
  useGetShiftsQuery,
  useGetCurrentShiftQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
  useProcessPaymentMutation,
  useRefundPaymentMutation,
  useLazyGetReceiptQuery,
} = paymentsApi
