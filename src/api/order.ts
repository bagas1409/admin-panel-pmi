import api from './axios'
import type { Order } from '@/types'

export const orderService = {
    getAll: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>('/admin/orders')
        return response.data
    },

    getDetail: async (id: number): Promise<Order> => {
        const response = await api.get<Order>(`/admin/orders/${id}`)
        return response.data
    },
}
