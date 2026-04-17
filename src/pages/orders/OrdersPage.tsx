import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { orderService } from '@/api/order'
import type { Order } from '@/types'

const statusVariant = {
    PENDING: 'warning',
    PAID: 'primary',
    SHIPPED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger',
} as const

const paymentVariant = {
    PENDING: 'warning',
    PAID: 'success',
    FAILED: 'danger',
    REFUNDED: 'default',
} as const

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await orderService.getAll()
                setOrders(data)
            } catch (err) {
                setError('Gagal memuat data orders')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Order Monitoring</h1>

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
            {!loading && !error && orders.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-[var(--text-muted)]">Belum ada data</p>
                </Card>
            )}

            {/* Table */}
            {!loading && !error && orders.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        User ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        UMKM ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-[var(--background)]/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{order.userId}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{order.umkmId}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={paymentVariant[order.paymentStatus] || 'default'}>
                                                {order.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                                            {formatDate(order.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-[var(--text)] mb-4">Order #{selectedOrder.id}</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">User ID</span>
                                    <span className="font-medium text-[var(--text)]">{selectedOrder.userId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">UMKM ID</span>
                                    <span className="font-medium text-[var(--text)]">{selectedOrder.umkmId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">Total</span>
                                    <span className="font-medium text-[var(--text)]">{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--text-muted)]">Status</span>
                                    <Badge variant={statusVariant[selectedOrder.status] || 'default'}>
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--text-muted)]">Payment</span>
                                    <Badge variant={paymentVariant[selectedOrder.paymentStatus] || 'default'}>
                                        {selectedOrder.paymentStatus}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-muted)]">Tanggal</span>
                                    <span className="text-[var(--text)]">{formatDate(selectedOrder.createdAt)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full mt-6 px-4 py-2.5 bg-[var(--background)] text-[var(--text)] rounded-xl font-medium hover:bg-[var(--border)] transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
