import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, ArrowDownCircle, CheckCircle, XCircle, Plus, X, Clock, MapPin, Activity } from 'lucide-react'
import { getStockRequests, createStockRequest, approveStockRequest, rejectStockRequest } from '@/api/distribution'
import { regionService } from '@/api/region'
import type { Region } from '@/types'

const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const
type BT = typeof BLOOD_TYPES[number]
const BT_COLORS: Record<BT, { bg: string; text: string; border: string }> = {
  A:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  B:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  O:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  AB: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
}
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Menunggu',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Disetujui', cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Ditolak',   cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function DistributionPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<any[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('PENDING')

  // Form buat permintaan baru
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ regionId: '', bloodType: 'A' as BT, quantity: 1, notes: '' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [reqs, regs] = await Promise.all([
        getStockRequests(filterStatus || undefined),
        regionService.getAll()
      ])
      setRequests(reqs)
      setRegions(regs)
      if (regs.length > 0 && !form.regionId) setForm(f => ({ ...f, regionId: regs[0].id }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [filterStatus])

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui permintaan ini? Stok UDD akan berkurang dan stok DC akan bertambah.')) return
    setProcessingId(id)
    try { await approveStockRequest(id); fetchAll() }
    catch (e: any) { alert(e?.response?.data?.message || 'Gagal approve') }
    finally { setProcessingId(null) }
  }

  const handleReject = async (id: string) => {
    const notes = prompt('Alasan penolakan (opsional):') ?? undefined
    setProcessingId(id)
    try { await rejectStockRequest(id, notes); fetchAll() }
    catch (e: any) { alert(e?.response?.data?.message || 'Gagal tolak') }
    finally { setProcessingId(null) }
  }

  const handleCreate = async () => {
    if (!form.regionId || form.quantity <= 0) return alert('Isi semua field dengan benar.')
    setSaving(true)
    try {
      await createStockRequest({ ...form, notes: form.notes || undefined })
      setShowForm(false)
      setForm(f => ({ ...f, quantity: 1, notes: '' }))
      fetchAll()
    } catch (e: any) { alert(e?.response?.data?.message || 'Gagal buat permintaan') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <ArrowDownCircle className="w-6 h-6 text-[var(--primary)]" />
            Distribusi Stok Darah
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Kelola permintaan pengambilan stok WB dari UDD → Distribution Center
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/distribution-center')}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Droplet className="w-4 h-4" /> Distribution Center
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Buat Permintaan
          </button>
        </div>
      </div>

      {/* Filter Status */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              filterStatus === s
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s === '' ? 'Semua' : STATUS_BADGE[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Daftar Permintaan */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 animate-pulse font-medium">Memuat permintaan...</div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Tidak ada permintaan</p>
            <p className="text-gray-400 text-sm mt-1">Belum ada permintaan stok dengan status ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {requests.map(r => {
              const bt = r.bloodType as BT
              const c = BT_COLORS[bt] || BT_COLORS['A']
              const badge = STATUS_BADGE[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
              return (
                <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50">
                  {/* Golongan darah */}
                  <div
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black text-lg shrink-0"
                    style={{ backgroundColor: c.bg, color: c.text, border: `1.5px solid ${c.border}` }}
                  >
                    {bt}
                    <span className="text-[10px] font-medium opacity-70">WB</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{r.region?.name || 'UDD Tidak Diketahui'}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      <strong style={{ color: c.text }}>{r.quantity} kantong</strong> WB-{bt} diminta
                      {r.requestedBy && <> · oleh <span className="font-medium">{r.requestedBy}</span></>}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(r.requestedAt).toLocaleString('id-ID')}
                      </span>
                      {r.notes && <span className="italic truncate max-w-[200px]">"{r.notes}"</span>}
                    </div>
                  </div>

                  {/* Aksi */}
                  {r.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        disabled={processingId === r.id}
                        onClick={() => handleReject(r.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                      <button
                        disabled={processingId === r.id}
                        onClick={() => handleApprove(r.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 text-sm font-semibold transition-opacity disabled:opacity-50 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  )}
                  {r.status === 'APPROVED' && r.logs?.[0] && (
                    <div className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 shrink-0">
                      ✅ Disetujui oleh <strong>{r.logs[0].approvedBy}</strong><br />
                      {new Date(r.logs[0].approvedAt).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Buat Permintaan */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--primary)]" />
                Buat Permintaan Stok DC
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">UDD Sumber</label>
                <select
                  value={form.regionId}
                  onChange={e => setForm(f => ({ ...f, regionId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                >
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name} ({r.kodeUdd})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Golongan Darah (WB)</label>
                <div className="flex gap-2">
                  {BLOOD_TYPES.map(bt => {
                    const c = BT_COLORS[bt]
                    return (
                      <button key={bt} onClick={() => setForm(f => ({ ...f, bloodType: bt }))}
                        className="flex-1 py-2 rounded-xl border-2 font-bold text-sm transition-all"
                        style={form.bloodType === bt
                          ? { backgroundColor: c.bg, borderColor: c.text, color: c.text }
                          : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#9ca3af' }}
                      >{bt}</button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Kantong</label>
                <input
                  type="number" min={1} value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none h-20"
                  placeholder="Keterangan kebutuhan pengambilan..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 shadow-sm">
                  {saving ? 'Mengirim...' : 'Kirim Permintaan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
