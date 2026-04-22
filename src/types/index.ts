export interface DonationHistory {
    id: string
    locationName: string
    donationDate: string
}

export interface DonorProfileFull {
    fullName: string
    nik: string
    whatsappNumber: string
    bloodType?: 'A' | 'B' | 'AB' | 'O'
    totalDonations: number
    lastDonationDate?: string
    // Biodata Lanjutan
    gender?: 'MALE' | 'FEMALE'
    birthPlace?: string
    birthDate?: string
    job?: string
    maritalStatus?: string
    // Alamat
    address?: string
    village?: string
    subdistrict?: string
    city?: string
    latitude?: number
    longitude?: number
}

export interface EventParticipant {
    id: string
    status: string
    registeredAt: string
    event?: {
        title: string
        locationName: string
        startDate: string
    }
}

export interface User {
    id: string
    email: string
    role: 'USER' | 'ADMIN_PMI' | 'HOSPITAL'
    isActive: boolean
    createdAt?: string
    donorProfile?: DonorProfileFull
    donationHistories?: DonationHistory[]
    eventParticipants?: EventParticipant[]
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
