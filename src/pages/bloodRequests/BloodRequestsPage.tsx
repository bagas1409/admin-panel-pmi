import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, FileText, Droplet, User, Activity, MapPin } from 'lucide-react'
import { getStockRequests, approveStockRequest, rejectStockRequest } from '@/api/distribution'

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

export default function BloodRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('PENDING')
  
  // Struk Modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const data = await getStockRequests(filterStatus || undefined)
      setRequests(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [filterStatus])

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui permintaan ini? Stok UDD Anda akan berkurang secara otomatis.')) return
    setProcessingId(id)
    try { await approveStockRequest(id); fetchAll() }
    catch (e: any) { alert(e?.response?.data?.message || 'Gagal menyetujui') }
    finally { setProcessingId(null) }
  }

  const handleReject = async (id: string) => {
    const notes = prompt('Alasan penolakan (opsional):') ?? undefined
    setProcessingId(id)
    try { await rejectStockRequest(id, notes); fetchAll() }
    catch (e: any) { alert(e?.response?.data?.message || 'Gagal menolak') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--primary)]" />
          Permintaan Darah (Dari DC)
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Daftar antrean permintaan pengambilan WB dari Distribution Center ke UDD Anda.
        </p>
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
          <div className="py-16 text-center text-gray-400 animate-pulse font-medium">Memuat antrean permintaan...</div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Tidak ada permintaan</p>
            <p className="text-gray-400 text-sm mt-1">Belum ada permintaan masuk dengan status ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {requests.map(r => {
              const bt = r.bloodType as BT
              const c = BT_COLORS[bt] || BT_COLORS['A']
              const badge = STATUS_BADGE[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
              return (
                <div key={r.id} className="rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow bg-white flex flex-col group relative">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <button 
                      onClick={() => setSelectedRequest(r)}
                      className="text-gray-400 hover:text-[var(--primary)] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                     <div
                        className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-2xl shrink-0 shadow-sm"
                        style={{ backgroundColor: c.bg, color: c.text, border: `2px solid ${c.border}` }}
                      >
                        {bt}
                        <span className="text-[10px] font-bold opacity-80 uppercase leading-none mt-0.5">WB</span>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-gray-800">{r.quantity} <span className="text-sm text-gray-500 font-medium">Kantong</span></div>
                        <div className="text-xs font-semibold text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {r.region?.name || 'UDD'}
                        </div>
                      </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1.5 font-medium">
                     <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(r.requestedAt).toLocaleString('id-ID')}
                     </div>
                     <div className="flex items-center gap-2 truncate">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {r.requestedBy || 'Admin DC'}
                     </div>
                  </div>

                  {/* Aksi */}
                  {r.status === 'PENDING' && (
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        disabled={processingId === r.id}
                        onClick={() => handleReject(r.id)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-sm font-bold transition-colors disabled:opacity-50 border border-red-100"
                      >
                        Tolak
                      </button>
                      <button
                        disabled={processingId === r.id}
                        onClick={() => handleApprove(r.id)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 text-sm font-bold transition-opacity disabled:opacity-50 shadow-sm"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                  
                  {/* Overlay onClick (kalau bukan pending, klik card langsung buka Struk) */}
                  {r.status !== 'PENDING' && (
                    <div 
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => setSelectedRequest(r)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Struk / Detail Nota */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#fdfdfd] rounded-sm w-full max-w-sm shadow-2xl relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            {/* Header struk mirip kertas */}
            <div className="absolute top-0 inset-x-0 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
            
            <div className="p-8 pt-10 text-center">
                <div className="w-14 h-14 bg-red-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Droplet className="w-8 h-8" />
                </div>
                <h2 className="font-black text-[var(--text)] text-xl tracking-tight uppercase">Nota Pengambilan</h2>
                <div className="text-gray-400 text-xs font-mono mt-1">ID: {selectedRequest.id.split('-')[0].toUpperCase()}</div>

                <div className="my-6 border-t-2 border-dashed border-gray-200"></div>

                <div className="space-y-4 text-left">
                   <div>
                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Dari UDD</div>
                     <div className="font-semibold text-gray-800 text-sm">{selectedRequest.region?.name}</div>
                   </div>
                   
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Produk</div>
                        <div className="font-black text-lg" style={{ color: BT_COLORS[selectedRequest.bloodType as BT]?.text || '#DC2626' }}>
                          WB - {selectedRequest.bloodType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Jumlah</div>
                        <div className="font-black text-2xl text-gray-800">{selectedRequest.quantity} <span className="text-xs text-gray-500">Kt</span></div>
                      </div>
                   </div>

                   <div>
                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Diminta Oleh</div>
                     <div className="font-medium text-gray-800 text-sm flex items-center justify-between">
                       <span>{selectedRequest.requestedBy || 'Admin DC'}</span>
                       <span className="text-xs text-gray-500 font-mono">{new Date(selectedRequest.requestedAt).toLocaleDateString('id-ID')}</span>
                     </div>
                   </div>

                   {selectedRequest.notes && (
                     <div>
                       <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Catatan Permintaan</div>
                       <div className="text-sm text-gray-600 bg-yellow-50/50 p-2 rounded italic text-center text-balance border border-yellow-100/50">"{selectedRequest.notes}"</div>
                     </div>
                   )}
                </div>

                <div className="my-6 border-t-2 border-dashed border-gray-200"></div>

                {/* Status Section */}
                <div className="text-center font-bold">
                    {selectedRequest.status === 'APPROVED' ? (
                      <div className="text-green-600 flex flex-col items-center">
                         <div className="px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs mb-2 uppercase tracking-widest inline-flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Telah Disetujui
                         </div>
                         <div className="text-[10px] text-gray-400">
                            oleh {selectedRequest.logs?.[0]?.approvedBy || 'Admin PMI'}<br/>
                            {new Date(selectedRequest.logs?.[0]?.approvedAt || selectedRequest.approvedAt).toLocaleString('id-ID')}
                         </div>
                      </div>
                    ) : selectedRequest.status === 'REJECTED' ? (
                      <div className="text-red-600 flex flex-col items-center">
                         <div className="px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs mb-2 uppercase tracking-widest inline-flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Ditolak
                         </div>
                         {selectedRequest.notes && <div className="text-[10px] text-gray-500">Alasan: {selectedRequest.notes}</div>}
                      </div>
                    ) : (
                      <div className="text-amber-600 uppercase tracking-widest text-xs py-1">Menunggu Persetujuan</div>
                    )}
                </div>

                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="mt-8 w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Tutup Nota
                </button>
            </div>
            {/* Footer struk mirip kertas (bottom zig-zag) */}
            <div className="absolute bottom-0 inset-x-0 h-3 bg-white" style={{ clipPath: 'polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%)' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
