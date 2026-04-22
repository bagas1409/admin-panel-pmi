import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { userService } from '@/api/user'
import type { User } from '@/types'
import { Search, Ban, CheckCircle, Eye, UserPlus, Droplets } from 'lucide-react'
import UserDetailDrawer from './UserDetailDrawer'
import AddDonorModal from './AddDonorModal'
import DonorinModal from './DonorinModal'

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // State untuk drawer detail
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    // State untuk modal tambah pendonor
    const [showAddModal, setShowAddModal] = useState(false)

    // State untuk Donorin Modal
    const [donorinUser, setDonorinUser] = useState<User | null>(null)

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await userService.getAll()
            setUsers(data)
        } catch (err) {
            setError('Gagal memuat data pendonor.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleBan = async (id: string) => {
        if (!confirm('Yakin ingin menonaktifkan akun pendonor ini?')) return
        setActionLoading(id)
        try {
            await userService.ban(id)
            await fetchUsers()
        } catch {
            alert('Gagal menonaktifkan akun.')
        } finally {
            setActionLoading(null)
        }
    }

    const handleUnban = async (id: string) => {
        if (!confirm('Yakin ingin mengaktifkan kembali akun ini?')) return
        setActionLoading(id)
        try {
            await userService.unban(id)
            await fetchUsers()
        } catch {
            alert('Gagal mengaktifkan akun.')
        } finally {
            setActionLoading(null)
        }
    }

    const filteredUsers = users.filter((user) => {
        const name = user.donorProfile?.fullName ?? ''
        const matchesSearch =
            name.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())

        const matchesFilter =
            filter === 'ALL' ||
            (filter === 'BANNED' && !user.isActive) ||
            (filter === 'ACTIVE' && user.isActive)

        return matchesSearch && matchesFilter
    })

    const bloodBadge: Record<string, string> = {
        A: 'bg-red-100 text-red-700',
        B: 'bg-blue-100 text-blue-700',
        AB: 'bg-purple-100 text-purple-700',
        O: 'bg-orange-100 text-orange-700',
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)]">Manajemen Pendonor</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{users.length} pendonor terdaftar</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Tambah Pendonor
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email pendonor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {(['ALL', 'ACTIVE', 'BANNED'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text)]'
                                    }`}
                            >
                                {status === 'ALL' ? 'Semua' : status === 'ACTIVE' ? 'Aktif' : 'Dinonaktifkan'}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-t-transparent" />
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredUsers.length === 0 && (
                <Card className="p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-[var(--text-muted)]">Tidak ada data pendonor ditemukan.</p>
                </Card>
            )}

            {/* Table */}
            {!loading && !error && filteredUsers.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Pendonor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Kontak</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Gol. Darah</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Donor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-[var(--background)]/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-[var(--primary)]">
                                                        {(user.donorProfile?.fullName ?? user.email ?? '?')[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text)]">{user.donorProfile?.fullName ?? '-'}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                                            {user.donorProfile?.whatsappNumber ?? '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.donorProfile?.bloodType ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${bloodBadge[user.donorProfile.bloodType]}`}>
                                                    <Droplets className="w-3 h-3" />
                                                    {user.donorProfile.bloodType || '?'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[var(--text-muted)] italic">Belum diisi</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-[var(--text)]">
                                                {user.donorProfile?.totalDonations ?? 0}
                                                <span className="font-normal text-[var(--text-muted)]"> kali</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.isActive ? 'success' : 'danger'}>
                                                {user.isActive ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedUserId(user.id)}
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {user.isActive ? (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleBan(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        loading={actionLoading === user.id}
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                        Ban
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleUnban(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        loading={actionLoading === user.id}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Aktifkan
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Side Drawer: Detail Pendonor */}
            <UserDetailDrawer
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
                onDonorin={(userToRegister) => setDonorinUser(userToRegister)}
            />

            {/* Modal: Tambah Pendonor Walk-in */}
            <AddDonorModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchUsers}
            />

            {/* Modal: Daftarkan (Donorin) relawan ke Event/UDD */}
            <DonorinModal
                isOpen={!!donorinUser}
                user={donorinUser}
                onClose={() => setDonorinUser(null)}
                // Kita tidak perlu menutup drawe user-nya saat sukses, mungkin refresh data detailnya?
                // Sementara cukup tutup DonorinModal.
                onSuccess={() => {
                    setDonorinUser(null)
                    // Refresh current global users list
                    fetchUsers()
                }}
            />
        </div>
    )
}
