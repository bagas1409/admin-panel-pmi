export interface DonationHistory {
    id: string
    locationName: string
    donationDate: string
}

export interface User {
    id: string
    email: string
    role: 'USER' | 'ADMIN_PMI' | 'HOSPITAL'
    isActive: boolean
    donorProfile?: {
        fullName: string
        nik: string
        whatsappNumber: string
        bloodType: 'A' | 'B' | 'AB' | 'O'
        rhesus: 'POSITIVE' | 'NEGATIVE'
        totalDonations: number
        lastDonationDate?: string
    }
    donationHistories?: DonationHistory[]
}

export interface LoginResponse {
    token: string
    user: User
}

export interface ApiError {
    message: string
    status?: number
}

export interface Region {
    id: string
    kodeUdd?: string
    name: string
    address: string
    latitude: number
    longitude: number
    createdAt?: string
    updatedAt?: string
}

export interface BloodStock {
    id: string
    regionId: string
    bloodType: 'A' | 'B' | 'AB' | 'O'
    productType: 'PRC' | 'TC' | 'WB' | 'FFP' | 'AHF' | 'LP'
    quantity: number
    updatedAt?: string
    region?: Region
}
