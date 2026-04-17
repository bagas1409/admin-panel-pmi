import api from './axios'
import type { AuditLog } from '@/types'

export const auditService = {
    getAll: async (): Promise<AuditLog[]> => {
        const response = await api.get<AuditLog[]>('/admin/audit-logs')
        return response.data
    },
}
