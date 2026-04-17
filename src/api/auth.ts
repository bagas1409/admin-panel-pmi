import api from './axios'
import type { LoginResponse } from '@/types'

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        // Karena Backend menggunakan format ApiResponse.success(_, _, data)
        const response = await api.post('/auth/login', { email, password })
        return response.data.data
    },

    getProfile: async () => {
        const response = await api.get('/auth/me') // diperbaiki sekalian routenya dari /me menjadi /auth/me
        return response.data.data
    },
}
