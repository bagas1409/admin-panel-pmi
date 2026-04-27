import { useState, useEffect } from 'react'
import { Building2, Droplet, User, Clock, CheckCircle, XCircle, FileText, Activity, AlertTriangle, ClipboardList } from 'lucide-react'
import { getHospitalBloodRequests, processBloodRequest, rejectBloodRequest, getDispensingHistory } from '@/api/hospital'

const BT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  B:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  O:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  AB: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:      { label: 'Menunggu',     cls: 'bg-amber-50 text-amber-700 border-amber-200'   },
  DIPROSES:     { label: 'Diproses',     cls: 'bg-blue-50 text-blue-700 border-blue-200'      },
  SIAP_DIAMBIL: { label: 'Siap Diambil', cls: 'bg-teal-50 text-teal-700 border-teal-200'     },
  SELESAI:      { label: 'Selesai',      cls: 'bg-green-50 text-green-700 border-green-200'  },
  DITOLAK:      { label: 'Ditolak',      cls: 'bg-red-50 text-red-700 border-red-200'        },
}

const URGENCY_BADGE: Record<string, string> = {
  NORMAL:  'bg-gray-100 text-gray-600',
  SEGERA:  'bg-orange-100 text-orange-700',
  DARURAT: 'bg-red-600 text-white animate-pulse',
}

type Tab = 'requests' | 'history'

export default function HospitalRequestsPage() {
  const [tab, setTab] = useState<Tab>('requests')
  const [requests, setRequests] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Modal proses
  const [processModal, setProcessModal] = useState<any | null>(null)
  const [namaPengambil, setNamaPengambil] = useState('')
  const [detailModal, setDetailModal] = useState<any | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const [reqs, hist] = await Promise.all([
        getHospitalBloodRequests(filterStatus || undefined),
        getDispensingHistory()
      ])
      setRequests(reqs)
      setHistory(hist)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [filterStatus])

  const handleProcess = async () => {
    if (!processModal || !namaPengambil.trim()) return alert('Nama pengambil wajib diisi!')
    setProcessingId(processModal.id)
    try {
      await processBloodRequest(processModal.id, namaPengambil)
      setProcessModal(null); setNamaPengambil(''); fetchRequests()
    } catch (e: any) { alert(e?.response?.data?.message || 'Gagal memproses') }
    finally { setProcessingId(null) }
  }

  const handleReject = async (id: string) => {
    const alasan = prompt('Alasan penolakan (opsional):') ?? undefined
    setProcessingId(id)
    try { await rejectBloodRequest(id, alasan); fetchRequests() }
    catch (e: any) { alert(e?.response?.data?.message || 'Gagal menolak') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[var(--primary)]" />
          Permintaan Darah RS Swasta
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Kelola permintaan darah dari rumah sakit swasta yang telah terverifikasi.
        </p>
      </div>

      {/* Tab */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['requests', 'history'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'requests' ? <><ClipboardList className="w-4 h-4 inline mr-1.5" />Permintaan Masuk</> : <><FileText className="w-4 h-4 inline mr-1.5" />Riwayat Pengeluaran</>}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <>
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {['', 'PENDING', 'SELESAI', 'DITOLAK'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${filterStatus === s ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                {s === '' ? 'Semua' : STATUS_MAP[s]?.label || s}
              </button>
            ))}
          </div>

          {/* List Request */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 py-20 text-center text-gray-400 animate-pulse">Memuat permintaan...</div>
            ) : requests.length === 0 ? (
              <div className="col-span-2 py-20 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">Tidak ada permintaan masuk</p>
              </div>
            ) : requests.map(r => {
              const c = BT_COLORS[r.golonganDarah] || BT_COLORS['A']
              const badge = STATUS_MAP[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
              return (
                <div key={r.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-5 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-gray-800">{r.hospitalProfile?.namaRs}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(r.requestedAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${badge.cls}`}>{badge.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${URGENCY_BADGE[r.tingkatUrgensi]}`}>
                        {r.tingkatUrgensi === 'DARURAT' && '🚨 '}{r.tingkatUrgensi}
                      </span>
                    </div>
                  </div>

                  {/* Blood Info */}
                  <div className="flex items-center gap-4 mb-4 p-3 rounded-xl" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black text-xl shrink-0" style={{ backgroundColor: 'white', color: c.text, border: `2px solid ${c.border}` }}>
                      {r.golonganDarah}
                      <span className="text-[9px] font-bold opacity-70 uppercase">{r.jenisProduk}</span>
                    </div>
                    <div>
                      <div className="text-3xl font-black" style={{ color: c.text }}>{r.jumlahKantong} <span className="text-sm font-medium text-gray-500">kantong</span></div>
                      <div className="text-xs font-semibold" style={{ color: c.text }}>Gol. {r.golonganDarah} — {r.jenisProduk}</div>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                    <div className="flex gap-2"><User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" /><div><span className="font-medium text-gray-700">{r.namaPasien}</span> <span className="text-gray-400 text-xs">— {r.noRekamMedis}</span></div></div>
                    <div className="flex gap-2"><Droplet className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" /><span className="text-gray-600">dr. {r.namaDokter}</span></div>
                    <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">"{r.alasanMedis}"</div>
                  </div>

                  {/* Tombol Aksi */}
                  {r.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button onClick={() => handleReject(r.id)} disabled={!!processingId}
                        className="py-2 rounded-xl bg-red-50 text-red-700 font-bold text-sm border border-red-100 hover:bg-red-100">
                        Tolak
                      </button>
                      <button onClick={() => { setProcessModal(r); setNamaPengambil('') }} disabled={!!processingId}
                        className="py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 shadow-sm flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Proses
                      </button>
                    </div>
                  )}

                  {r.status === 'SELESAI' && r.dispensing && (
                    <button onClick={() => setDetailModal(r)} className="mt-4 w-full py-2 rounded-xl bg-green-50 text-green-700 font-semibold text-sm border border-green-200 hover:bg-green-100 flex items-center justify-center gap-1">
                      <FileText className="w-4 h-4" /> Lihat Struk Pengeluaran
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-bold text-gray-800">Riwayat Pengeluaran Darah ke RS Swasta</h2>
            <p className="text-xs text-gray-500 mt-0.5">Audit trail permanen — tidak dapat diubah</p>
          </div>
          {history.length === 0 ? (
            <div className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Belum ada riwayat pengeluaran</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {history.map(d => {
                const c = BT_COLORS[d.golonganDarah] || BT_COLORS['A']
                return (
                  <div key={d.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50">
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black text-lg shrink-0"
                      style={{ backgroundColor: c.bg, color: c.text, border: `1.5px solid ${c.border}` }}>
                      {d.golonganDarah}<span className="text-[9px]">{d.jenisProduk}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{d.namaRs}</div>
                      <div className="text-sm text-gray-600">Pasien: <span className="font-medium">{d.namaPasien}</span> ({d.noRekamMedis})</div>
                      <div className="text-xs text-gray-400 flex gap-3 mt-0.5">
                        <span>dr. {d.namaDokter}</span>
                        <span>·</span>
                        <span>Petugas: {d.namaPetugasPmi}</span>
                        <span>·</span>
                        <span>Pengambil: {d.namaPengambil}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black" style={{ color: c.text }}>{d.jumlahKantong} <span className="text-xs font-normal text-gray-400">Kt</span></div>
                      <div className="text-xs text-gray-400">{new Date(d.dispensedAt).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Proses Request */}
      {processModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> Konfirmasi Pengeluaran Darah
              </h2>
              <button onClick={() => setProcessModal(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                <div><span className="text-gray-500">RS:</span> <span className="font-semibold">{processModal.hospitalProfile?.namaRs}</span></div>
                <div><span className="text-gray-500">Pasien:</span> <span className="font-semibold">{processModal.namaPasien}</span></div>
                <div><span className="text-gray-500">Produk:</span> <span className="font-semibold text-[var(--primary)]">{processModal.golonganDarah}-{processModal.jenisProduk} × {processModal.jumlahKantong} Kantong</span></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Pengambil dari Pihak RS <span className="text-red-500">*</span></label>
                <input
                  value={namaPengambil}
                  onChange={e => setNamaPengambil(e.target.value)}
                  placeholder="Nama kurir/petugas dari RS yang mengambil..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>
              <p className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                ⚠️ Setelah dikonfirmasi, stok DC akan <strong>otomatis berkurang</strong> dan transaksi ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setProcessModal(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Batal</button>
                <button onClick={handleProcess} disabled={!!processingId || !namaPengambil.trim()}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 shadow-sm">
                  {processingId ? 'Memproses...' : 'Konfirmasi & Selesaikan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Struk */}
      {detailModal && detailModal.dispensing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-[#fdfdfd] rounded-sm w-full max-w-sm shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}
            style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            <div className="absolute top-0 inset-x-0 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
            <div className="p-8 pt-10 text-center">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><Building2 className="w-8 h-8" /></div>
              <h2 className="font-black text-gray-800 text-xl uppercase">Struk Pengeluaran</h2>
              <div className="text-gray-400 text-xs font-mono mt-1">ID: {detailModal.id.split('-')[0].toUpperCase()}</div>
              <div className="my-5 border-t-2 border-dashed border-gray-200"></div>
              <div className="space-y-3 text-left text-sm">
                {[
                  ['RS', detailModal.dispensing.namaRs],
                  ['Pasien', `${detailModal.dispensing.namaPasien} (${detailModal.dispensing.noRekamMedis})`],
                  ['Dokter', `dr. ${detailModal.dispensing.namaDokter}`],
                  ['Alasan Medis', detailModal.dispensing.alasanMedis],
                  ['Petugas PMI', detailModal.dispensing.namaPetugasPmi],
                  ['Pengambil', detailModal.dispensing.namaPengambil],
                ].map(([label, val]) => (
                  <div key={label}><div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</div><div className="font-medium text-gray-700">{val}</div></div>
                ))}
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3">
                  <div><div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Produk</div><div className="font-black text-lg text-[var(--primary)]">{detailModal.dispensing.golonganDarah}-{detailModal.dispensing.jenisProduk}</div></div>
                  <div className="text-right"><div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Jumlah</div><div className="font-black text-2xl">{detailModal.dispensing.jumlahKantong} <span className="text-xs text-gray-400">Kt</span></div></div>
                </div>
              </div>
              <div className="my-5 border-t-2 border-dashed border-gray-200"></div>
              <div className="text-xs text-gray-400">{new Date(detailModal.dispensing.dispensedAt).toLocaleString('id-ID')}</div>
              <button onClick={() => setDetailModal(null)} className="mt-6 w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200">Tutup</button>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-3 bg-white" style={{ clipPath: 'polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%)' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
