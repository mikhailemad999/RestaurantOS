import { baseApi } from './baseApi'

export interface OrderItem {
  id: string
  menu_item: string
  menu_item_name: string
  variant?: string | null
  variant_name?: string | null
  quantity: number
  unit_price: string
  total_price: string
  special_instructions: string
  is_completed_in_kitchen: boolean
}

export interface Order {
  id: string
  order_number: string
  table?: string | null
  table_number?: string | null
  server?: string | null
  server_name?: string | null
  order_type: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' | 'QR_ORDER'
  status: 'DRAFT' | 'SENT_TO_KITCHEN' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED'
  customer_name: string
  customer_phone: string
  guest_count: number
  subtotal: string
  tax_amount: string
  discount_amount: string
  service_charge: string
  total_amount: string
  kitchen_notes: string
  payment_status: string
  elapsed_minutes: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface CreateOrderPayload {
  table?: string | null
  order_type?: string
  customer_name?: string
  customer_phone?: string
  guest_count?: number
  subtotal: number | string
  tax_amount: number | string
  discount_amount?: number | string
  service_charge?: number | string
  total_amount: number | string
  kitchen_notes?: string
  items: {
    menu_item: string
    variant?: string | null
    quantity: number
    unit_price: number | string
    total_price: number | string
    special_instructions?: string
  }[]
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => '/orders/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Orders'],
    }),

    getKitchenKds: builder.query<Order[], void>({
      query: () => '/orders/kitchen-kds/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Kitchen', 'Orders'],
    }),

    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({
        url: '/orders/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Kitchen', 'Tables'],
    }),

    updateOrderStatus: builder.mutation<{ success: boolean; data: Order }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/update-status/`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['Orders', 'Kitchen', 'Tables'],
    }),

    toggleOrderItemCompleted: builder.mutation<{ success: boolean; is_completed: boolean }, { orderId: string; itemId: string }>({
      query: ({ orderId, itemId }) => ({
        url: `/orders/${orderId}/toggle-item/`,
        method: 'POST',
        body: { item_id: itemId },
      }),
      invalidatesTags: ['Kitchen', 'Orders'],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetKitchenKdsQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useToggleOrderItemCompletedMutation,
} = ordersApi
