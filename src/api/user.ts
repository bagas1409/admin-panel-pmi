import api from './axios'
import type { User } from '@/types'

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/admin/users')
        return response.data
    },

    ban: async (id: number): Promise<void> => {
        await api.patch(`/admin/users/${id}/ban`)
    },

    unban: async (id: number): Promise<void> => {
        await api.patch(`/admin/users/${id}/unban`)
    },

    updateRole: async (id: number, role: 'USER' | 'UMKM' | 'ADMIN'): Promise<void> => {
        await api.patch(`/admin/users/${id}/role`, { role })
    },
}
