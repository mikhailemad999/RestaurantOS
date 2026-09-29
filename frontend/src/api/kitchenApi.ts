import { baseApi } from './baseApi'
import { Order } from './ordersApi'

export interface KitchenStation {
  id: string
  name: string
  branch: string | null
  is_active: boolean
  display_color: string
  display_order: number
  created_at: string
}

export interface KitchenTicket {
  id: string
  ticket_number: string
  order: string
  order_number: string
  order_details: Order
  table_number: string | null
  station: string | null
  station_name: string | null
  status: 'PENDING' | 'IN_PREP' | 'READY' | 'BUMPED'
  bump_time: string | null
  elapsed_minutes: number
  notes: string
  created_at: string
}

export const kitchenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKitchenStations: builder.query<KitchenStation[], void>({
      query: () => '/kitchen/stations/',
      providesTags: ['Kitchen'],
    }),
    getKitchenTickets: builder.query<KitchenTicket[], { station_id?: string; status?: string } | void>({
      query: (params) => ({
        url: '/kitchen/tickets/',
        params: params || {},
      }),
      providesTags: ['Kitchen'],
    }),
    bumpTicket: builder.mutation<{ success: boolean; ticket_id: string; status: string }, string>({
      query: (id) => ({
        url: `/kitchen/tickets/${id}/bump/`,
        method: 'POST',
      }),
      invalidatesTags: ['Kitchen', 'Orders'],
    }),
    updateTicketStatus: builder.mutation<{ success: boolean; ticket: KitchenTicket }, { id: string; status: string }>({
      query: ({ id, ...body }) => ({
        url: `/kitchen/tickets/${id}/update-status/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Kitchen', 'Orders'],
    }),
  }),
})

export const {
  useGetKitchenStationsQuery,
  useGetKitchenTicketsQuery,
  useBumpTicketMutation,
  useUpdateTicketStatusMutation,
} = kitchenApi
