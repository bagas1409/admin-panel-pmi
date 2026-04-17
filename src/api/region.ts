import api from './axios'
import type { Region } from '@/types'

export const regionService = {
    // Ambil semua Region
    getAll: async (): Promise<Region[]> => {
        const { data } = await api.get('/regions')
        return data.data
    },

    // Buat Region baru
    create: async (payload: { name: string; address: string; latitude: number; longitude: number }): Promise<Region> => {
        // Backend juga memerlukan detail lengkap atau opsional, tapi berdasarkan schema prisma: name, address, latitude, longitude
        const { data } = await api.post('/regions', payload)
        return data.data
    },

    // Update Region
    update: async (id: string, payload: Partial<Region>): Promise<Region> => {
        const { data } = await api.put(`/regions/${id}`, payload)
        return data.data
    },

    // Hapus Region
    delete: async (id: string): Promise<void> => {
        await api.delete(`/regions/${id}`)
    },

    // Ambil Registrants Markas Harian
    getRegistrants: async (regionId: string) => {
        const { data } = await api.get(`/regions/${regionId}/registrants`)
        return data.data
    },

    // Verifikasi Kehadiran Registrant Markas Harian
    updateRegistrant: async (registrantId: string, status: 'ATTENDED' | 'ABSENT') => {
        const { data } = await api.patch(`/regions/registrants/${registrantId}`, { status })
        return data.data
    }
}
