import { baseApi } from './baseApi'

export interface AuditLogItem {
  id: string
  user: number | null
  user_name: string | null
  user_email: string | null
  user_role: string | null
  action: string
  module: string
  description: string
  ip_address: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface AuditStats {
  total_logs: number
  actions: Record<string, number>
  modules: Record<string, number>
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogItem[], { module?: string; action?: string; search?: string } | void>({
      query: (params) => ({
        url: '/audit-logs/logs/',
        params: params || {},
      }),
      providesTags: ['AuditLogs'],
    }),
    getAuditStats: builder.query<AuditStats, void>({
      query: () => '/audit-logs/logs/stats/',
      providesTags: ['AuditLogs'],
    }),
  }),
})

export const {
  useGetAuditLogsQuery,
  useGetAuditStatsQuery,
} = auditApi
