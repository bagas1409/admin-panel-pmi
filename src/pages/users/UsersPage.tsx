import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { userService } from '@/api/user'
import type { User } from '@/types'
import { Search, Ban, CheckCircle } from 'lucide-react'

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL')
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await userService.getAll()
            setUsers(data)
        } catch (err) {
            setError('Gagal memuat data users')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleBan = async (id: number) => {
        if (!confirm('Yakin ingin ban user ini?')) return
        setActionLoading(id)
        try {
            await userService.ban(id)
            await fetchUsers()
        } catch (err) {
            alert('Gagal ban user')
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUnban = async (id: number) => {
        if (!confirm('Yakin ingin unban user ini?')) return
        setActionLoading(id)
        try {
            await userService.unban(id)
            await fetchUsers()
        } catch (err) {
            alert('Gagal unban user')
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateRole = async (id: number, newRole: 'USER' | 'UMKM' | 'ADMIN') => {
        if (!confirm(`Ubah role user ini menjadi ${newRole}?`)) return
        setActionLoading(id)
        try {
            await userService.updateRole(id, newRole)
            await fetchUsers()
        } catch (err) {
            alert('Gagal update role')
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())

        const matchesFilter =
            filter === 'ALL' ||
            (filter === 'BANNED' && user.status === 'BANNED') ||
            (filter === 'ACTIVE' && user.status !== 'BANNED')

        return matchesSearch && matchesFilter
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-6">User Management</h1>

            {/* Filters */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
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
                                {status}
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
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-t-transparent"></div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredUsers.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-[var(--text-muted)]">Belum ada data</p>
                </Card>
            )}

            {/* Table */}
            {!loading && !error && filteredUsers.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[var(--background)]/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-[var(--text)]">{user.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="bg-[var(--background)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] block p-1.5"
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user.id, e.target.value as 'USER' | 'UMKM' | 'ADMIN')}
                                                    disabled={actionLoading === user.id || user.role === 'ADMIN'}
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="UMKM">UMKM</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                                {actionLoading === user.id && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--primary)] border-t-transparent"></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.status === 'BANNED' ? 'danger' : 'success'}>
                                                {user.status || 'ACTIVE'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'ADMIN' && (
                                                user.status === 'BANNED' ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleUnban(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        loading={actionLoading === user.id}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Unban
                                                    </Button>
                                                ) : (
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
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}
