import api from './axios'
import type { UMKMProfile } from '@/types'

export const umkmService = {
    getPending: async (): Promise<UMKMProfile[]> => {
        const response = await api.get<UMKMProfile[]>('/admin/umkm/pending')
        return response.data
    },

    approve: async (id: number): Promise<void> => {
        await api.patch(`/admin/umkm/${id}/approve`)
    },

    reject: async (id: number, reason?: string): Promise<void> => {
        await api.patch(`/admin/umkm/${id}/reject`, { reason })
    },

    getActive: async (): Promise<UMKMProfile[]> => {
        const response = await api.get<UMKMProfile[]>('/public/umkm')
        return response.data
    },
}
