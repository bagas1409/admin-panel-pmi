const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api'

export interface Province {
    id: string
    name: string
}

export interface Regency {
    id: string
    province_id: string
    name: string
}

export interface District {
    id: string
    regency_id: string
    name: string
}

export interface Village {
    id: string
    district_id: string
    name: string
}

export const wilayahService = {
    getProvinces: async (): Promise<Province[]> => {
        try {
            const res = await fetch(`${BASE_URL}/provinces.json`)
            if (!res.ok) throw new Error('Network response was not ok')
            return await res.json()
        } catch (error) {
            console.error('Failed to fetch provinces', error)
            return []
        }
    },
    
    getRegencies: async (provinceId: string): Promise<Regency[]> => {
        if (!provinceId) return []
        try {
            const res = await fetch(`${BASE_URL}/regencies/${provinceId}.json`)
            if (!res.ok) throw new Error('Network response was not ok')
            return await res.json()
        } catch (error) {
            console.error(`Failed to fetch regencies for province ${provinceId}`, error)
            return []
        }
    },

    getDistricts: async (regencyId: string): Promise<District[]> => {
        if (!regencyId) return []
        try {
            const res = await fetch(`${BASE_URL}/districts/${regencyId}.json`)
            if (!res.ok) throw new Error('Network response was not ok')
            return await res.json()
        } catch (error) {
            console.error(`Failed to fetch districts for regency ${regencyId}`, error)
            return []
        }
    },

    getVillages: async (districtId: string): Promise<Village[]> => {
        if (!districtId) return []
        try {
            const res = await fetch(`${BASE_URL}/villages/${districtId}.json`)
            if (!res.ok) throw new Error('Network response was not ok')
            return await res.json()
        } catch (error) {
            console.error(`Failed to fetch villages for district ${districtId}`, error)
            return []
        }
    }
}
