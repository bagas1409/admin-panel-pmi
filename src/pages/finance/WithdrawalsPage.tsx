import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { withdrawalService, WithdrawRequest } from '@/api/withdrawal'
import { CheckCircle } from 'lucide-react'

export default function WithdrawalsPage() {
    const [requests, setRequests] = useState<WithdrawRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    const fetchRequests = async () => {
        try {
            setIsLoading(true)
            const data = await withdrawalService.getAll()
            setRequests(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (id: number, amount: string) => {
        if (!confirm(`Setujui penarikan sebesar Rp ${Number(amount).toLocaleString()}?`)) return

        try {
            setIsProcessing(true)
            await withdrawalService.approve(id)
            alert('Withdrawal berhasil disetujui (Sandbox)')
            fetchRequests()
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal memproses withdrawal'
            alert(msg)
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Withdrawals</h1>

            <Card className="overflow-hidden">
                <div className="p-6 border-b border-[var(--border)]">
                    <h2 className="text-lg font-semibold text-[var(--text)]">Permintaan Penarikan</h2>
                </div>
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--background)]/50">
                                <tr>
                                    <th className="py-3 px-6">Waktu</th>
                                    <th className="py-3 px-6">Toko</th>
                                    <th className="py-3 px-6">Bank</th>
                                    <th className="py-3 px-6">Jumlah</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">Loading...</td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-[var(--text-muted)]">
                                            Tidak ada permintaan.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((item) => (
                                        <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--background)] transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[var(--text)]">
                                                        {new Date(item.requestedAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-[var(--text-muted)]">
                                                        {new Date(item.requestedAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-[var(--text)]">{item.storeName}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium">{item.bankName}</div>
                                                <div className="text-xs text-[var(--text-muted)] font-mono">{item.bankAccount}</div>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-green-600">
                                                Rp {Number(item.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge
                                                    variant={item.status === 'COMPLETED' ? 'success' : 'warning'}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                {item.status === 'PENDING' ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(item.id, item.amount)}
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? '...' : 'Approve'}
                                                    </Button>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                                        <CheckCircle className="w-4 h-4" /> Selesai
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    )
}
