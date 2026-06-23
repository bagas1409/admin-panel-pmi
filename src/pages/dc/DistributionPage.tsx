import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, ArrowDownCircle, Plus, X, Clock, MapPin, Activity } from 'lucide-react'
import { getStockRequests, createStockRequest } from '@/api/distribution'
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
  const [filterStatus, setFilterStatus] = useState<string>('PENDING')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

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
            Kelola permintaan pengambilan stok WB ke UDD. Menunggu persetujuan dari sisi UDD di menu Permintaan Darah.
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white text-sm font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-2"
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-[var(--border)]">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left font-bold">UDD Sumber</th>
                  <th className="px-6 py-3 text-left font-bold">Golongan</th>
                  <th className="px-6 py-3 text-left font-bold">Jumlah</th>
                  <th className="px-6 py-3 text-left font-bold">Status</th>
                  <th className="px-6 py-3 text-left font-bold">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {requests.map(r => {
                  const bt = r.bloodType as BT
                  const c = BT_COLORS[bt] || BT_COLORS['A']
                  const badge = STATUS_BADGE[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50 cursor-pointer group transition-colors" onClick={() => setSelectedRequest(r)}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{r.region?.name || 'UDD Tidak Diketahui'}</div>
                        {r.notes && <div className="text-xs text-gray-400 italic mt-0.5 truncate max-w-[150px]">"{r.notes}"</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg font-bold text-xs border" style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}>
                          {bt} WB
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">{r.quantity} Kt</td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        {r.status === 'APPROVED' && r.logs?.[0] && (
                          <div className="text-xs mt-1 text-green-600 font-medium truncate max-w-[150px]">✓ {r.logs[0].approvedBy}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(r.requestedAt).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 shadow-sm active:scale-[0.98] transition-all">
                  {saving ? 'Mengirim...' : 'Kirim Permintaan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal (View Only) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--text)]/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)}></div>
          <div className="relative w-full max-w-lg bg-[var(--card-bg)] rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-[var(--background)] border-b border-[var(--border)] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)]">
                  <ArrowDownCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)] leading-tight">Detail Pengambilan</h2>
                  <p className="text-xs text-[var(--text-muted)]">ID: {selectedRequest.id.split('-')[0]}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 rounded-full hover:bg-[var(--border)] flex items-center justify-center transition-colors text-[var(--text-muted)]">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex gap-4">
                <div className={`flex-1 p-4 rounded-xl border flex flex-col justify-center ${STATUS_BADGE[selectedRequest.status]?.cls || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <div className="font-bold uppercase tracking-wider text-sm">{STATUS_BADGE[selectedRequest.status]?.label || selectedRequest.status}</div>
                  <div className="text-[10px] font-bold opacity-80 mt-1">Diajukan: {new Date(selectedRequest.requestedAt).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex-1 p-4 rounded-xl border flex flex-col justify-center bg-blue-50 text-blue-700 border-blue-200">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">UDD Sumber</div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedRequest.region?.name || 'UDD Tidak Diketahui'}
                  </div>
                </div>
              </div>

              {selectedRequest.status === 'APPROVED' && selectedRequest.logs?.[0] && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex gap-3">
                  <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm mb-1">Disetujui oleh {selectedRequest.logs[0].approvedBy}</div>
                    <div className="text-xs opacity-90 leading-relaxed font-medium">Pada tanggal {new Date(selectedRequest.logs[0].approvedAt).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Kebutuhan WB</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-3xl font-black" style={{ color: BT_COLORS[selectedRequest.bloodType as BT]?.text || '#000' }}>
                        {selectedRequest.bloodType}
                      </span>
                      <span className="font-bold text-[var(--text)] text-lg">WB</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-black text-[var(--text)] px-3 py-1.5 bg-white border border-[var(--border)] rounded-lg inline-block self-start">
                    {selectedRequest.quantity} Kantong
                  </div>
                </div>
                
                <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Keterangan Transaksi</div>
                  <div className="text-xs font-mono font-bold text-[var(--text-muted)] mt-1">Kode: {selectedRequest.id.substring(0, 8).toUpperCase()}</div>
                  <div className="text-xs text-[var(--text)] mt-3 font-bold flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[var(--primary)]" /> Pengiriman reguler
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Catatan Pengambilan</div>
                  <div className="text-sm font-medium text-[var(--text)] leading-relaxed bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] italic min-h-[60px]">
                    {selectedRequest.notes || "Tidak ada catatan."}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex">
              <button onClick={() => setSelectedRequest(null)} className="w-full py-4 bg-slate-100 text-[var(--text-muted)] rounded-xl font-bold hover:bg-slate-200 transition-all">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
