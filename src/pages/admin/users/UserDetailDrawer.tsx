import { useEffect, useState } from 'react'
import {
    X, User, Droplets, Activity, MapPin,
    Calendar, Heart, Clock, CheckCircle,
    AlertCircle, Shield
} from 'lucide-react'
import { userService } from '@/api/user'
import type { User as UserType } from '@/types'

interface Props {
    userId: string | null
    onClose: () => void
    onDonorin: (user: UserType) => void
}

const bloodBadge: Record<string, string> = {
    A: 'bg-red-100 text-red-700',
    B: 'bg-blue-100 text-blue-700',
    AB: 'bg-purple-100 text-purple-700',
    O: 'bg-orange-100 text-orange-700',
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="flex flex-col gap-0.5 py-2 border-b border-[var(--border)] last:border-0">
            <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">{label}</span>
            <span className="text-sm text-[var(--text)] font-medium">{value ?? <span className="text-[var(--text-muted)] italic">Belum diisi</span>}</span>
        </div>
    )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="flex items-center gap-2 mt-6 mb-3">
            <Icon className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">{title}</h3>
        </div>
    )
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

const getDonorStatus = (days: number | null) => {
    if (days === null) return { label: 'Belum Pernah Donor', color: 'text-gray-600 bg-gray-100', icon: CheckCircle, isReady: true }
    if (days < 60) return { label: `Masa Pemulihan (${days} hari)`, color: 'text-amber-600 bg-amber-50', icon: Clock, isReady: false }
    return { label: `Siap Donor Ulang (${days} hari)`, color: 'text-red-600 bg-red-50', icon: Activity, isReady: true }
}

export default function UserDetailDrawer({ userId, onClose, onDonorin }: Props) {
    const [user, setUser] = useState<UserType | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId) return
        setLoading(true)
        setError(null)
        userService.getProfile(userId)
            .then(setUser)
            .catch(() => setError('Gagal memuat data profil.'))
            .finally(() => setLoading(false))
    }, [userId])

    const isOpen = !!userId

    // Jika lastDonationDate dari profile kosong namun dia punya donasi, ambil tanggal dari log riwayat teratas
    const computedLatestDonationDate = user?.donorProfile?.lastDonationDate 
        || user?.donationHistories?.[0]?.donationDate

    const lastDonationDays = computedLatestDonationDate
        ? Math.floor((Date.now() - new Date(computedLatestDonationDate).getTime()) / (1000 * 60 * 60 * 24))
        : null

    const donorStatus = getDonorStatus(lastDonationDays)

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-[var(--background)] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--primary)]/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">Detail Pendonor</p>
                            <p className="text-sm font-bold text-[var(--text)]">
                                {loading ? '...' : (user?.donorProfile?.fullName ?? user?.email ?? '-')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-8">
                    {/* Loading */}
                    {loading && (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Content */}
                    {!loading && !error && user && (
                        <>
                            {/* Status chips */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {user.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {user.isActive ? 'Akun Aktif' : 'Akun Dinonaktifkan'}
                                </span>
                                {user.donorProfile?.bloodType && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${bloodBadge[user.donorProfile.bloodType]}`}>
                                        <Droplets className="w-3 h-3" />
                                        {user.donorProfile.bloodType}
                                    </span>
                                )}
                                {donorStatus && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${donorStatus.color}`}>
                                        <donorStatus.icon className="w-3 h-3" />
                                        {donorStatus.label}
                                    </span>
                                )}
                            </div>

                            {/* Daftarkan Manual */}
                            <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-red-50/50 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--text)]">Daftarkan Event / Markas</h4>
                                    <p className="text-xs text-[var(--text-muted)]">Input manual untuk relawan ini</p>
                                </div>
                                <button
                                    onClick={() => onDonorin(user)}
                                    disabled={!donorStatus.isReady}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Activity className="w-4 h-4" />
                                    Donorin
                                </button>
                            </div>

                            {/* Identitas Utama */}
                            <SectionTitle icon={Shield} title="Identitas Utama" />
                            <InfoRow label="Nama Lengkap" value={user.donorProfile?.fullName} />
                            <InfoRow label="NIK KTP" value={user.donorProfile?.nik} />
                            <InfoRow label="Email" value={user.email} />
                            <InfoRow label="No. WhatsApp" value={user.donorProfile?.whatsappNumber} />
                            <InfoRow label="Tanggal Daftar" value={formatDate(user.createdAt)} />

                            {/* Data Medis */}
                            <SectionTitle icon={Heart} title="Data Medis Donor" />
                            <InfoRow label="Gol. Darah" value={user.donorProfile?.bloodType || 'Belum diatur'} />
                            <InfoRow label="Total Donasi" value={user.donorProfile?.totalDonations ? `${user.donorProfile.totalDonations} kali` : 'Belum pernah donor'} />
                            <InfoRow label="Donor Terakhir" value={computedLatestDonationDate ? formatDate(computedLatestDonationDate) : 'Belum pernah donor'} />

                            {/* Biodata Diri */}
                            <SectionTitle icon={User} title="Biodata Diri" />
                            <InfoRow label="Jenis Kelamin" value={user.donorProfile?.gender === 'MALE' ? 'Laki-laki' : user.donorProfile?.gender === 'FEMALE' ? 'Perempuan' : undefined} />
                            <InfoRow label="Tempat Lahir" value={user.donorProfile?.birthPlace} />
                            <InfoRow label="Tanggal Lahir" value={formatDate(user.donorProfile?.birthDate)} />
                            <InfoRow label="Pekerjaan" value={user.donorProfile?.job} />
                            <InfoRow label="Status Pernikahan" value={user.donorProfile?.maritalStatus} />

                            {/* Alamat */}
                            <SectionTitle icon={MapPin} title="Alamat Domisili" />
                            <InfoRow label="Alamat Lengkap" value={user.donorProfile?.address} />
                            <InfoRow label="Kelurahan" value={user.donorProfile?.village} />
                            <InfoRow label="Kecamatan" value={user.donorProfile?.subdistrict} />
                            <InfoRow label="Kabupaten/Kota" value={user.donorProfile?.city} />

                            {/* Riwayat Donasi */}
                            <SectionTitle icon={Droplets} title="Riwayat Donasi" />
                            {(user.donationHistories?.length ?? 0) === 0 ? (
                                <p className="text-sm text-[var(--text-muted)] italic py-2">Belum ada riwayat donasi.</p>
                            ) : (
                                <div className="space-y-2">
                                    {user.donationHistories?.map((h) => (
                                        <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                                <Droplets className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--text)]">{h.locationName}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{formatDate(h.donationDate)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Keikutsertaan Event */}
                            <SectionTitle icon={Calendar} title="Keikutsertaan Event" />
                            {(user.eventParticipants?.length ?? 0) === 0 ? (
                                <p className="text-sm text-[var(--text-muted)] italic py-2">Belum mengikuti event apapun.</p>
                            ) : (
                                <div className="space-y-2">
                                    {user.eventParticipants?.map((ep) => (
                                        <div key={ep.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--text)] truncate">{ep.event?.title ?? '-'}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{ep.event?.locationName} · {formatDate(ep.event?.startDate)}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-semibold ${ep.status === 'PRESENT' ? 'bg-green-100 text-green-700' : ep.status === 'REGISTERED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {ep.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
