import api from './axios'

export interface WithdrawRequest {
    id: number
    amount: string
    bankName: string
    bankAccount: string
    status: 'PENDING' | 'COMPLETED'
    requestedAt: string
    storeName: string
    umkmId: number
}

export const withdrawalService = {
    getAll: async (status?: string): Promise<WithdrawRequest[]> => {
        const response = await api.get<WithdrawRequest[]>('/admin/withdrawals', {
            params: { status }
        })
        return response.data
    },

    approve: async (id: number): Promise<void> => {
        await api.patch(`/admin/withdrawals/${id}/approve`)
    },
}
