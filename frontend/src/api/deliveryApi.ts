import { baseApi } from './baseApi'
import { Order } from './ordersApi'

export interface Driver {
  id: string
  name: string
  phone: string
  vehicle_type: string
  license_plate: string
  is_active: boolean
  current_status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE'
}

export interface DeliveryOrder {
  id: string
  order: string
  order_details?: Order
  driver?: string | null
  driver_name?: string | null
  driver_phone?: string | null
  channel: 'DIRECT' | 'DOORDASH' | 'UBEREATS' | 'DELIVEROO'
  stage: 'RECEIVED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED'
  delivery_address: string
  customer_notes: string
  estimated_arrival_minutes: number
  tracking_url: string
  created_at: string
}

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query<Driver[], void>({
      query: () => '/delivery/drivers/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Drivers'],
    }),

    getDeliveries: builder.query<DeliveryOrder[], void>({
      query: () => '/delivery/orders/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Delivery'],
    }),

    assignDriver: builder.mutation<{ success: boolean; data: DeliveryOrder }, { deliveryId: string; driverId: string }>({
      query: ({ deliveryId, driverId }) => ({
        url: `/delivery/orders/${deliveryId}/assign-driver/`,
        method: 'POST',
        body: { driver_id: driverId },
      }),
      invalidatesTags: ['Delivery', 'Drivers'],
    }),

    updateDeliveryStage: builder.mutation<{ success: boolean; data: DeliveryOrder }, { deliveryId: string; stage: string }>({
      query: ({ deliveryId, stage }) => ({
        url: `/delivery/orders/${deliveryId}/update-stage/`,
        method: 'POST',
        body: { stage },
      }),
      invalidatesTags: ['Delivery'],
    }),
  }),
})

export const {
  useGetDriversQuery,
  useGetDeliveriesQuery,
  useAssignDriverMutation,
  useUpdateDeliveryStageMutation,
} = deliveryApi
