import { baseApi } from './baseApi'

export interface NotificationItem {
  id: string
  recipient: number | null
  notification_type: 'ORDER_CREATED' | 'ORDER_READY' | 'PAYMENT_RECEIVED' | 'SHIFT_ALERT' | 'LOW_STOCK' | 'SYSTEM_NOTICE'
  title: string
  message: string
  is_read: boolean
  link_url: string
  created_at: string
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationItem[], void>({
      query: () => '/notifications/alerts/',
      providesTags: ['Notifications'],
    }),
    getUnreadCount: builder.query<{ unread_count: number }, void>({
      query: () => '/notifications/alerts/unread-count/',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/alerts/${id}/mark-read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/notifications/alerts/mark-all-read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi
