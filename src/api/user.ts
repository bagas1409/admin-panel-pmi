import api from './axios'
import type { User } from '@/types'

export const userService = {
    // Ambil semua pendonor
    getAll: async (): Promise<User[]> => {
        const { data } = await api.get('/users')
        return data.data
    },

    // Ambil profil lengkap satu pendonor
    getProfile: async (userId: string): Promise<User> => {
        const { data } = await api.get(`/users/${userId}/profile`)
        return data.data
    },

    // Admin registrasi pendonor manual (walk-in)
    adminRegister: async (payload: {
        email: string
        password: string
        fullName: string
        nik: string
        whatsappNumber: string
        bloodType?: string
        gender?: string
        birthDate?: string
        birthPlace?: string
        job?: string
        maritalStatus?: string
        address?: string
        village?: string
        subdistrict?: string
        city?: string
    }): Promise<{ userId: string; email: string; fullName: string }> => {
        const { data } = await api.post('/users/register', payload)
        return data.data
    },

    // Aktifkan / nonaktifkan akun
    ban: async (id: string): Promise<void> => {
        await api.patch(`/admin/users/${id}/ban`)
    },

    unban: async (id: string): Promise<void> => {
        await api.patch(`/admin/users/${id}/unban`)
    },

    updateRole: async (id: string, role: 'USER' | 'ADMIN_PMI'): Promise<void> => {
        await api.patch(`/admin/users/${id}/role`, { role })
    },

    // Admin daftarkan user ke Markas atau Event
    adminDonorin: async (userId: string, payload: { targetType: 'REGION' | 'EVENT'; targetId: string }): Promise<any> => {
        const { data } = await api.post(`/users/${userId}/donorin`, payload)
        return data.data
    },
}
