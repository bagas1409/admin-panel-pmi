import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, ArrowLeft, Building2, CalendarDays } from 'lucide-react'
import { getDCStock } from '@/api/distribution'

const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const
type BT = typeof BLOOD_TYPES[number]
const BT_COLORS: Record<BT, { bg: string; text: string; border: string }> = {
  A:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  B:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  O:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  AB: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
}

export default function DCStockPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<{ stocks: any[]; receptionLogs: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDCStock()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stockMap: Record<string, number> = {}
  data?.stocks.forEach(s => { stockMap[s.bloodType] = s.quantity })
  const totalWB = Object.values(stockMap).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/distribution-center')}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <Droplet className="w-6 h-6 text-[var(--primary)]" />
            Stok Mentah WB – Distribution Center
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Whole Blood yang diterima dari UDD, siap diolah
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Memuat stok DC...</div>
      ) : (
        <>
          {/* Kartu Stok Per Golongan */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOOD_TYPES.map(bt => {
              const qty = stockMap[bt] || 0
              const c = BT_COLORS[bt]
              return (
                <div key={bt} className="rounded-2xl p-5 border flex flex-col items-center gap-2 shadow-sm"
                  style={{ backgroundColor: c.bg, borderColor: c.border }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl"
                    style={{ backgroundColor: c.border, color: c.text }}>
                    {bt}
                  </div>
                  <div className="text-3xl font-extrabold" style={{ color: c.text }}>{qty}</div>
                  <div className="text-xs font-semibold opacity-70" style={{ color: c.text }}>kantong WB</div>
                </div>
              )
            })}
          </div>

          {/* Total banner */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplet className="w-6 h-6 text-[var(--primary)]" />
              <span className="font-bold text-gray-800">Total Stok WB di DC</span>
            </div>
            <div className="text-3xl font-black text-[var(--primary)]">{totalWB} <span className="text-base font-semibold text-gray-500">kantong</span></div>
          </div>

          {/* Riwayat Penerimaan */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-800">Riwayat Penerimaan dari UDD</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{data?.receptionLogs.length || 0} catatan</span>
            </div>
            {!data?.receptionLogs.length ? (
              <div className="py-12 text-center text-gray-400 font-medium">Belum ada penerimaan stok.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-[var(--border)]">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left font-bold">UDD Sumber</th>
                    <th className="px-6 py-3 text-left font-bold">Golongan</th>
                    <th className="px-6 py-3 text-left font-bold">Jumlah</th>
                    <th className="px-6 py-3 text-left font-bold">Disetujui Oleh</th>
                    <th className="px-6 py-3 text-left font-bold">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data?.receptionLogs.map((log: any) => {
                    const c = BT_COLORS[log.bloodType as BT] || BT_COLORS['A']
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-semibold text-gray-800">{log.regionName}</td>
                        <td className="px-6 py-3">
                          <span className="px-2.5 py-1 rounded-lg font-bold text-xs border"
                            style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}>
                            {log.bloodType} WB
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-gray-700">{log.quantity} Kt</td>
                        <td className="px-6 py-3 text-gray-600">{log.approvedBy || 'Admin PMI'}</td>
                        <td className="px-6 py-3 text-gray-400 text-xs flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(log.approvedAt).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
