import api from './axios'
import type { Dispute } from '@/types'

export const disputeService = {
    getAll: async (): Promise<Dispute[]> => {
        const response = await api.get<Dispute[]>('/admin/disputes')
        return response.data
    },

    resolve: async (id: number, resolution: 'REFUND' | 'RELEASE'): Promise<void> => {
        await api.patch(`/admin/disputes/${id}/resolve`, { decision: resolution })
    },
}
