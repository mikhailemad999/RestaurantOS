import { baseApi } from './baseApi'

export interface Table {
  id: string
  floor: string
  floor_name?: string
  table_number: string
  capacity: number
  shape: 'ROUND' | 'SQUARE' | 'RECTANGLE' | 'BOOTH'
  status: 'VACANT' | 'OCCUPIED' | 'BILLED' | 'RESERVED' | 'DIRTY'
  position_x: number
  position_y: number
  assigned_server: string
  current_guest_count: number
  current_order_total: string
  seated_at: string | null
}

export interface Floor {
  id: string
  name: string
  level: number
  is_active: boolean
  tables: Table[]
}

export const tablesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFloors: builder.query<Floor[], void>({
      query: () => '/tables/floors/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Floors', 'Tables'],
    }),

    getTables: builder.query<Table[], void>({
      query: () => '/tables/tables/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Tables'],
    }),

    updateTableStatus: builder.mutation<{ success: boolean; data: Table }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/tables/tables/${id}/update-status/`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['Tables', 'Floors'],
    }),
  }),
})

export const {
  useGetFloorsQuery,
  useGetTablesQuery,
  useUpdateTableStatusMutation,
} = tablesApi
