import { useState, useEffect, useMemo } from 'react'
import { 
  LayoutDashboard, 
  Droplet, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Thermometer, 
  Archive 
} from "lucide-react"
import { 
  getMyBloodStocks, 
  getMyBloodUsages, 
  getMyBloodRequests 
} from '@/api/hospital'

const BLOOD_TYPES = ['A', 'B', 'AB', 'O']
const PRODUCT_TYPES = ['WB', 'PRC', 'TC', 'FFP']

const BT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  B:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  O:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  AB: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:      { label: 'Menunggu',     cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  DIPROSES:     { label: 'Diproses',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  SIAP_DIAMBIL: { label: 'Siap Diambil', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  SELESAI:      { label: 'Selesai',      cls: 'bg-green-50 text-green-700 border-green-200' },
  DITOLAK:      { label: 'Ditolak',      cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function HospitalDashboardPage() {
  // States
  const [stocks, setStocks] = useState<any[]>([])
  const [usages, setUsages] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [stocksData, usagesData, requestsData] = await Promise.all([
        getMyBloodStocks(),
        getMyBloodUsages(),
        getMyBloodRequests()
      ])
      setStocks(stocksData || [])
      setUsages(usagesData || [])
      setRequests(requestsData || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculations
  const totalStocks = useMemo(() => {
    return stocks.reduce((sum, item) => sum + (item.quantity || 0), 0)
  }, [stocks])

  const criticalStocksCount = useMemo(() => {
    return stocks.filter(item => (item.quantity || 0) < 5).length
  }, [stocks])

  const pmiProcessingCount = useMemo(() => {
    return requests.filter(req => req.status === 'PENDING' || req.status === 'DIPROSES').length
  }, [requests])

  const todaysTransfusionCount = useMemo(() => {
    const today = new Date().toDateString()
    return usages
      .filter(u => new Date(u.usedAt).toDateString() === today)
      .reduce((sum, item) => sum + (item.quantity || 0), 0)
  }, [usages])

  // Map stocks array into a grid coordinate system of [bloodType][productType]
  const stockGrid = useMemo(() => {
    const grid: Record<string, Record<string, number>> = {}
    BLOOD_TYPES.forEach(bt => {
      grid[bt] = {}
      PRODUCT_TYPES.forEach(pt => {
        grid[bt][pt] = 0
      })
    })
    stocks.forEach(item => {
      if (grid[item.bloodType] && grid[item.bloodType][item.productType] !== undefined) {
        grid[item.bloodType][item.productType] = item.quantity || 0
      }
    })
    return grid
  }, [stocks])



  return (
    <div className="bg-[var(--background)] min-h-screen -m-6 p-6 relative">
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div className="space-y-8 relative">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--primary)] tracking-tight leading-tight flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              Dashboard RS Swasta
            </h1>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">
              Pusat kendali persediaan darah rumah sakit, monitoring suhu cold-chain, dan pelacakan permintaan PMI.
            </p>
          </div>
        </div>

        {/* High-Level Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-[var(--primary)] border border-purple-100">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text)]">
                {loading ? '...' : totalStocks} <span className="text-xs font-semibold text-[var(--text-muted)]">Unit</span>
              </div>
              <div className="text-[10px] font-bold mt-0.5 tracking-wider uppercase text-[var(--text-muted)]">
                Stok Tersedia
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-red-600 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text)]">
                {loading ? '...' : criticalStocksCount} <span className="text-xs font-semibold text-[var(--text-muted)]">Item</span>
              </div>
              <div className="text-[10px] font-bold mt-0.5 tracking-wider uppercase text-[var(--text-muted)]">
                Stok Kritis (&lt;5)
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text)]">
                {loading ? '...' : pmiProcessingCount} <span className="text-xs font-semibold text-[var(--text-muted)]">Permintaan</span>
              </div>
              <div className="text-[10px] font-bold mt-0.5 tracking-wider uppercase text-[var(--text-muted)]">
                Diproses PMI
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 border border-emerald-100">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--text)]">
                {loading ? '...' : todaysTransfusionCount} <span className="text-xs font-semibold text-[var(--text-muted)]">Unit</span>
              </div>
              <div className="text-[10px] font-bold mt-0.5 tracking-wider uppercase text-[var(--text-muted)]">
                Transfusi Hari Ini
              </div>
            </div>
          </div>
        </div>

        {/* Cold Chain & Stock Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cold Chain Monitor */}
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="px-6 py-5 border-b border-slate-200 bg-[var(--background)]/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Thermometer className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Cold Chain Storage</h3>
              </div>
            </div>
            <div className="p-6 space-y-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Suhu Refrigerator</span>
                  <div className="text-4xl font-black text-[var(--text)] mt-1 flex items-baseline gap-1">
                    4.2 <span className="text-lg font-bold text-emerald-500">°C</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Optimal</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                  <span>Kapasitas Penyimpanan</span>
                  <span>{totalStocks} / 150 Unit</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-[var(--primary)] h-full transition-all duration-500" 
                    style={{ width: `${Math.min((totalStocks / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stock Matrix Grid */}
          <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-[var(--background)]/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[var(--primary)]">
                  <Droplet className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Matriks Persediaan</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-slate-100 px-2 py-0.5 rounded">Real-Time</span>
            </div>
            {loading ? (
              <div className="p-12 text-center text-[var(--text-muted)] animate-pulse">Memuat matriks stok...</div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-5 gap-3 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-slate-100 pb-3 mb-3">
                  <div>Tipe</div>
                  {PRODUCT_TYPES.map(pt => <div key={pt}>{pt}</div>)}
                </div>
                <div className="space-y-2">
                  {BLOOD_TYPES.map(bt => {
                    const c = BT_COLORS[bt]
                    return (
                      <div key={bt} className="grid grid-cols-5 gap-3 items-center text-center">
                        <div className="font-black text-sm w-9 h-9 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: c.bg, color: c.text, border: `1.5px solid ${c.border}` }}>
                          {bt}
                        </div>
                        {PRODUCT_TYPES.map(pt => {
                          const qty = stockGrid[bt]?.[pt] || 0
                          return (
                            <div key={pt} className="py-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-colors">
                              <span className={`text-xs font-black ${qty === 0 ? 'text-slate-300' : qty < 5 ? 'text-red-500 font-bold' : 'text-gray-700'}`}>
                                {qty}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Split View: Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Internal Transfusions Feed */}
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-[var(--background)]/30 flex justify-between items-center">
              <h3 className="text-base font-bold text-[var(--text)] tracking-tight">Pemakaian Terakhir (Internal)</h3>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Transfusi Pasien</span>
            </div>
            {loading ? (
              <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">Memuat riwayat pemakaian...</div>
            ) : usages.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] font-medium">Belum ada aktivitas transfusi terdaftar.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {usages.slice(0, 5).map(u => {
                  const c = BT_COLORS[u.bloodType] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }
                  return (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-[var(--background)]/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0" style={{ backgroundColor: c.bg, color: c.text, border: `1.5px solid ${c.border}` }}>
                          {u.bloodType}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text)] text-xs flex items-center gap-1.5">
                            {u.namaPasien}
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">RM: {u.noRekamMedis}</span>
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            dr. {u.namaDokter} • {u.alasanMedis}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-gray-700 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">{u.quantity} {u.productType}</span>
                        <div className="text-[9px] text-gray-400 font-mono mt-1">{new Date(u.usedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* PMI Blood Requests Feed */}
          <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-[var(--background)]/30 flex justify-between items-center">
              <h3 className="text-base font-bold text-[var(--text)] tracking-tight">Pelacakan Permintaan (PMI DC)</h3>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Log PMI</span>
            </div>
            {loading ? (
              <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">Memuat log pengajuan...</div>
            ) : requests.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] font-medium">Belum ada pengajuan ke PMI.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {requests.slice(0, 5).map(req => {
                  const c = BT_COLORS[req.golonganDarah] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }
                  const status = STATUS_MAP[req.status] || { label: req.status, cls: 'bg-gray-100 text-gray-500' }
                  return (
                    <div key={req.id} className="p-4 flex items-center justify-between hover:bg-[var(--background)]/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0" style={{ backgroundColor: c.bg, color: c.text, border: `1.5px solid ${c.border}` }}>
                          {req.golonganDarah}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text)] text-xs flex items-center gap-1.5">
                            {req.jumlahKantong} Kantong {req.jenisProduk}
                            {req.tingkatUrgensi === 'DARURAT' && (
                              <span className="text-[8px] bg-red-600 text-white font-bold px-1 py-0.5 rounded animate-pulse">CITO</span>
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {req.namaPasien ? `Pasien: ${req.namaPasien}` : `Buffer: ${req.unitLayanan}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.cls}`}>
                          {status.label}
                        </span>
                        <div className="text-[9px] text-gray-400 font-mono mt-1.5">{new Date(req.requestedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
