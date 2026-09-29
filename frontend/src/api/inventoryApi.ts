import { baseApi } from './baseApi'

export interface Supplier {
  id: string
  name: string
  contact_person: string
  phone: string
  email: string
  category: string
}

export interface InventoryItem {
  id: string
  supplier?: string | null
  supplier_name?: string | null
  name: string
  sku: string
  category: string
  unit: string
  current_stock: string
  par_level: string
  reorder_quantity: string
  cost_per_unit: string
  is_low_stock: boolean
}

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<Supplier[], void>({
      query: () => '/inventory/suppliers/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Suppliers'],
    }),

    getInventoryItems: builder.query<InventoryItem[], void>({
      query: () => '/inventory/items/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Inventory'],
    }),

    adjustStock: builder.mutation<{ success: boolean; current_stock: string }, { id: string; delta: number }>({
      query: ({ id, delta }) => ({
        url: `/inventory/items/${id}/adjust-stock/`,
        method: 'POST',
        body: { delta },
      }),
      invalidatesTags: ['Inventory'],
    }),

    createInventoryItem: builder.mutation<InventoryItem, Partial<InventoryItem>>({
      query: (body) => ({
        url: '/inventory/items/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
})

export const {
  useGetSuppliersQuery,
  useGetInventoryItemsQuery,
  useAdjustStockMutation,
  useCreateInventoryItemMutation,
} = inventoryApi
