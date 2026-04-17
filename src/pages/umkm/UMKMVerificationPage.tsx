import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { umkmService } from '@/api/umkm'
import type { UMKMProfile } from '@/types'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

export default function UMKMVerificationPage() {
    const [pendingUmkm, setPendingUmkm] = useState<UMKMProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [selectedUmkm, setSelectedUmkm] = useState<UMKMProfile | null>(null)

    const fetchPending = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await umkmService.getPending()
            setPendingUmkm(data)
        } catch (err) {
            setError('Gagal memuat data UMKM pending')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPending()
    }, [])

    const handleApprove = async (id: number) => {
        if (!confirm('Yakin ingin menyetujui UMKM ini?')) return
        setActionLoading(id)
        try {
            await umkmService.approve(id)
            await fetchPending()
            setSelectedUmkm(null)
        } catch (err) {
            alert('Gagal approve UMKM')
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: number) => {
        const reason = prompt('Masukkan alasan penolakan:')
        if (!reason) return
        setActionLoading(id)
        try {
            await umkmService.reject(id, reason)
            await fetchPending()
            setSelectedUmkm(null)
        } catch (err) {
            alert('Gagal reject UMKM')
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-6">UMKM Verification</h1>

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
            {!loading && !error && pendingUmkm.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-[var(--text-muted)]">Belum ada UMKM yang perlu diverifikasi</p>
                </Card>
            )}

            {/* Grid */}
            {!loading && !error && pendingUmkm.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingUmkm.map((umkm) => (
                        <Card key={umkm.id} className="overflow-hidden">
                            {/* Banner/Logo */}
                            <div className="h-32 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center">
                                {umkm.logoUrl ? (
                                    <img src={umkm.logoUrl} alt={umkm.storeName} className="w-20 h-20 rounded-full object-cover bg-white" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                                        {umkm.storeName?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-[var(--text)]">{umkm.storeName}</h3>
                                        <p className="text-sm text-[var(--text-muted)]">{umkm.slug}</p>
                                    </div>
                                    <Badge variant="warning">PENDING</Badge>
                                </div>

                                {umkm.address && (
                                    <p className="text-sm text-[var(--text-muted)] mb-4">{umkm.address}</p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setSelectedUmkm(umkm)}
                                        className="flex-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Detail
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleApprove(umkm.id)}
                                        disabled={actionLoading === umkm.id}
                                        loading={actionLoading === umkm.id}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleReject(umkm.id)}
                                        disabled={actionLoading === umkm.id}
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedUmkm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-[var(--text)] mb-4">Detail UMKM</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">Nama Toko</label>
                                    <p className="font-medium text-[var(--text)]">{selectedUmkm.storeName}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">Slug</label>
                                    <p className="font-medium text-[var(--text)]">{selectedUmkm.slug}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">Deskripsi</label>
                                    <p className="text-[var(--text)]">{selectedUmkm.description || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--text-muted)]">Alamat</label>
                                    <p className="text-[var(--text)]">{selectedUmkm.address || '-'}</p>
                                </div>
                                {selectedUmkm.ktpUrl && (
                                    <div>
                                        <label className="text-sm text-[var(--text-muted)]">Dokumen KTP</label>
                                        <img src={selectedUmkm.ktpUrl} alt="KTP" className="mt-2 w-full rounded-xl" />
                                    </div>
                                )}
                                {selectedUmkm.storePhotoUrl && (
                                    <div>
                                        <label className="text-sm text-[var(--text-muted)]">Foto Toko</label>
                                        <img src={selectedUmkm.storePhotoUrl} alt="Toko" className="mt-2 w-full rounded-xl" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button variant="secondary" onClick={() => setSelectedUmkm(null)} className="flex-1">
                                    Tutup
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => handleApprove(selectedUmkm.id)}
                                    disabled={actionLoading === selectedUmkm.id}
                                    loading={actionLoading === selectedUmkm.id}
                                    className="flex-1"
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleReject(selectedUmkm.id)}
                                    disabled={actionLoading === selectedUmkm.id}
                                    className="flex-1"
                                >
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
