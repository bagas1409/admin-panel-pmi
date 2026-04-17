import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { disputeService } from '@/api/dispute'
import type { Dispute } from '@/types'
import { RefreshCcw, Wallet } from 'lucide-react'

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const fetchDisputes = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await disputeService.getAll()
            setDisputes(data)
        } catch (err) {
            setError('Gagal memuat data disputes')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDisputes()
    }, [])

    const handleResolve = async (id: number, resolution: 'REFUND' | 'RELEASE') => {
        const confirmMsg = resolution === 'REFUND'
            ? 'Yakin ingin refund ke user?'
            : 'Yakin ingin release dana ke UMKM?'
        if (!confirm(confirmMsg)) return

        setActionLoading(id)
        try {
            await disputeService.resolve(id, resolution)
            await fetchDisputes()
        } catch (err) {
            alert('Gagal resolve dispute')
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Dispute Center</h1>

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
            {!loading && !error && disputes.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-[var(--text-muted)]">Belum ada dispute</p>
                </Card>
            )}

            {/* Table */}
            {!loading && !error && disputes.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        User ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Alasan
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
                                {disputes.map((dispute) => (
                                    <tr key={dispute.id} className="hover:bg-[var(--background)]/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">#{dispute.id}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">#{dispute.orderId}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{dispute.userId}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--text)] max-w-xs truncate">
                                            {dispute.reason}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={dispute.status === 'OPEN' ? 'warning' : 'success'}>
                                                {dispute.status}
                                                {dispute.resolution && ` - ${dispute.resolution}`}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {dispute.status === 'OPEN' && (
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleResolve(dispute.id, 'REFUND')}
                                                        disabled={actionLoading === dispute.id}
                                                        loading={actionLoading === dispute.id}
                                                    >
                                                        <RefreshCcw className="w-4 h-4" />
                                                        Refund
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleResolve(dispute.id, 'RELEASE')}
                                                        disabled={actionLoading === dispute.id}
                                                        loading={actionLoading === dispute.id}
                                                    >
                                                        <Wallet className="w-4 h-4" />
                                                        Release
                                                    </Button>
                                                </div>
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
