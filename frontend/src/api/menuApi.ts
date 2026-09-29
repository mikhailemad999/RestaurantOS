import { baseApi } from './baseApi'

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  sort_order: number
  is_active: boolean
  items_count?: number
}

export interface ItemVariant {
  id: string
  item: string
  name: string
  price: string
  sku: string
  is_default: boolean
}

export interface ModifierOption {
  id: string
  name: string
  price: string
  is_available: boolean
}

export interface ModifierGroup {
  id: string
  name: string
  min_selection: number
  max_selection: number
  is_required: boolean
  options: ModifierOption[]
}

export interface MenuItem {
  id: string
  category: string
  category_name?: string
  name: string
  slug: string
  description: string
  base_price: string
  image: string | null
  sku: string
  is_available: boolean
  prep_time_minutes: number
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  is_spicy: boolean
  variants?: ItemVariant[]
  modifier_groups?: ModifierGroup[]
  created_at: string
  updated_at: string
}

export interface CreateMenuItemPayload {
  category: string
  name: string
  description?: string
  base_price: string | number
  prep_time_minutes?: number
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  is_spicy?: boolean
  variants?: { name: string; price: string | number }[]
}

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/menu/categories/',
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['Categories'],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({
        url: '/menu/categories/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<Category, { id: string; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `/menu/categories/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Categories', 'MenuItems'],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/menu/categories/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'MenuItems'],
    }),

    getMenuItems: builder.query<MenuItem[], { category?: string } | void>({
      query: (params) => ({
        url: '/menu/items/',
        params: params || {},
      }),
      transformResponse: (res: any) => Array.isArray(res) ? res : res?.data || [],
      providesTags: ['MenuItems'],
    }),

    createMenuItem: builder.mutation<MenuItem, CreateMenuItemPayload>({
      query: (body) => ({
        url: '/menu/items/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MenuItems', 'Categories'],
    }),

    updateMenuItem: builder.mutation<MenuItem, { id: string; data: Partial<CreateMenuItemPayload> }>({
      query: ({ id, data }) => ({
        url: `/menu/items/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['MenuItems', 'Categories'],
    }),

    deleteMenuItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/menu/items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MenuItems', 'Categories'],
    }),

    toggleItemAvailability: builder.mutation<{ success: boolean; data: { is_available: boolean } }, string>({
      query: (id) => ({
        url: `/menu/items/${id}/toggle-availability/`,
        method: 'POST',
      }),
      invalidatesTags: ['MenuItems'],
    }),

    importMenuFile: builder.mutation<{ success: boolean; message: string; data: any }, FormData>({
      query: (formData) => ({
        url: '/menu/items/import-file/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['MenuItems', 'Categories'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useToggleItemAvailabilityMutation,
  useImportMenuFileMutation,
} = menuApi
