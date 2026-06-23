import { useState, useEffect } from 'react'
import { ShieldCheck, Clock, Check, X, Building2, User, Phone, MapPin, FileText, Activity } from 'lucide-react'
import { getRoleRequests, approveRoleRequest, rejectRoleRequest } from '@/api/hospital'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Disetujui', cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Ditolak', cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function HospitalRoleApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [detailModal, setDetailModal] = useState<any | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const data = await getRoleRequests(filterStatus || undefined)
      setRequests(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [filterStatus])

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui pengajuan ini? Role pengguna akan berubah menjadi RS_SWASTA dan profil RS akan dibuat otomatis.')) return
    setProcessingId(id)
    try { await approveRoleRequest(id); setDetailModal(null); fetchAll() }
    catch (e: any) { alert(e?.response?.data?.message || 'Gagal menyetujui') }
    finally { setProcessingId(null) }
  }

  const handleReject = async (id: string) => {
    const alasan = prompt('Alasan penolakan:') ?? undefined
    setProcessingId(id)
    try { await rejectRoleRequest(id, alasan); setDetailModal(null); fetchAll() }
    catch (e: any) { alert(e?.response?.data?.message || 'Gagal menolak') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[var(--primary)]" />
          Persetujuan Role RS Swasta
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Review dan setujui pengajuan akses dari Rumah Sakit Swasta.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${filterStatus === s ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {s === '' ? 'Semua' : STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 animate-pulse">Memuat pengajuan...</div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Tidak ada pengajuan</p>
            <p className="text-gray-400 text-sm mt-1">Belum ada pengajuan role dengan status ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {requests.map(r => {
              const badge = STATUS_MAP[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-500' }
              return (
                <div key={r.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{r.namaRs}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{r.namaPic} ({r.jabatanPic})</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.noTelpRs}</span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleString('id-ID')}
                      {r.user && <span className="ml-2">— {r.user.email}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setDetailModal(r)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 flex items-center gap-1">
                      <FileText className="w-4 h-4" /> Detail
                    </button>
                    {r.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleReject(r.id)} disabled={!!processingId}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-semibold hover:bg-red-100 flex items-center gap-1 disabled:opacity-50">
                          <X className="w-4 h-4" /> Tolak
                        </button>
                        <button onClick={() => handleApprove(r.id)} disabled={!!processingId}
                          className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:opacity-90 shadow-sm flex items-center gap-1 disabled:opacity-50">
                          <Check className="w-4 h-4" /> Setujui
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" /> Detail Pengajuan</h2>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { icon: Building2, label: 'Nama RS', value: detailModal.namaRs },
                { icon: FileText, label: 'No. Izin Operasional', value: detailModal.noIzinRs },
                { icon: MapPin, label: 'Alamat', value: detailModal.alamatRs },
                { icon: Phone, label: 'No. Telepon RS', value: detailModal.noTelpRs },
                { icon: User, label: 'Nama PIC', value: `${detailModal.namaPic} — ${detailModal.jabatanPic}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div><div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</div><div className="text-sm font-medium text-gray-700 mt-0.5">{value}</div></div>
                </div>
              ))}
              {detailModal.alasanTolak && (
                <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-sm text-red-700">
                  <strong>Alasan Penolakan:</strong> {detailModal.alasanTolak}
                </div>
              )}
              {detailModal.status === 'PENDING' && (
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button onClick={() => handleReject(detailModal.id)} disabled={!!processingId}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 disabled:opacity-50">Tolak</button>
                  <button onClick={() => handleApprove(detailModal.id)} disabled={!!processingId}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:opacity-90 shadow-sm disabled:opacity-50">Setujui</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
