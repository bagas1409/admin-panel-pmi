import api from './axios'

export const eventService = {
    getAll: async () => {
        const { data } = await api.get('/events')
        return data.data
    },
    create: async (payload: any) => {
        const { data } = await api.post('/events', payload)
        return data.data
    },
    delete: async (id: string) => {
        await api.delete(`/events/${id}`)
    },
    getParticipants: async (eventId: string) => {
        const { data } = await api.get(`/events/admin/${eventId}/participants`)
        return data.data
    },
    updateParticipantStatus: async (participantId: string, status: 'ATTENDED' | 'ABSENT') => {
        const { data } = await api.patch(`/events/admin/participants/${participantId}`, { status })
        return data.data
    }
}

export const broadcastService = {
    getAll: async () => {
        const { data } = await api.get('/notifications')
        return data.data
    },
    sendEmergency: async (payload: { title: string; message: string; type: string }) => {
        const { data } = await api.post('/notifications/broadcast', payload)
        return data.data
    }
}
