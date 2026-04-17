import api from './axios'

export const donorService = {
    // Ambil daftar users/donors
    getAllDonors: async () => {
        const { data } = await api.get('/users')
        return data.data
    },

    // Rekam riwayat pencapaian donor (History)
    recordDonation: async (payload: {
        userId: string,
        regionId?: string,
        quantity: number,
        notes?: string
    }) => {
        const { data } = await api.post('/donors/record', payload)
        return data.data
    },

    // Lihat log donor sebelumnya
    getDonationHistory: async (userId: string) => {
        const { data } = await api.get(`/donors/${userId}/history`)
        return data.data
    }
}
