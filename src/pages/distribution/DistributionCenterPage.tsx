import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, FlaskConical, ChevronRight, TrendingUp, Package } from 'lucide-react'
import { getDCStock, getDCInventory } from '@/api/distribution'

const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const
type BT = typeof BLOOD_TYPES[number]
const BT_COLORS: Record<BT, { bg: string; text: string; border: string }> = {
  A:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  B:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  O:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  AB: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
}
const PRODUCT_TYPES = ['WB', 'PRC', 'TC', 'FFP'] as const

export default function DistributionCenterPage() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDCStock(), getDCInventory()])
      .then(([stockData, invData]) => {
        setStocks(stockData.stocks || [])
        setInventory(invData || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Hitung total WB mentah
  const totalWB = stocks.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0)
  const stockByBT: Record<string, number> = {}
  stocks.forEach((s: any) => { stockByBT[s.bloodType] = s.quantity || 0 })

  // Hitung total inventori per produk
  const invByProduct: Record<string, number> = {}
  PRODUCT_TYPES.forEach(p => { invByProduct[p] = 0 })
  inventory.forEach((i: any) => { invByProduct[i.productType] = (invByProduct[i.productType] || 0) + i.quantity })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <Package className="w-6 h-6 text-[var(--primary)]" />
          Distribution Center
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Pusat pengolahan darah — stok mentah WB dan inventori produk turunan
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Memuat data DC...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Stok Mentah WB */}
          <button
            onClick={() => navigate('/distribution-center/stock')}
            className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm p-6 text-left hover:shadow-md hover:border-red-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-base">Stok Mentah WB</h2>
                  <p className="text-xs text-gray-500">Whole Blood dari UDD</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
            </div>

            {/* Total */}
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-black text-gray-800">{totalWB}</span>
              <span className="text-gray-400 font-semibold mb-1">kantong total</span>
            </div>

            {/* Per golongan darah */}
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_TYPES.map(bt => {
                const qty = stockByBT[bt] || 0
                const c = BT_COLORS[bt]
                return (
                  <div key={bt} className="rounded-xl p-2 text-center" style={{ backgroundColor: c.bg }}>
                    <div className="font-black text-sm" style={{ color: c.text }}>{bt}</div>
                    <div className="text-lg font-extrabold" style={{ color: c.text }}>{qty}</div>
                    <div className="text-[10px] font-medium opacity-60" style={{ color: c.text }}>Kt</div>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Lihat riwayat penerimaan dari UDD →
            </p>
          </button>

          {/* Card 2: Inventori Pengolahan */}
          <button
            onClick={() => navigate('/distribution-center/inventory')}
            className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm p-6 text-left hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-base">Inventori Pengolahan</h2>
                  <p className="text-xs text-gray-500">WB · PRC · TC · FFP</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>

            {/* Per produk */}
            <div className="space-y-3">
              {PRODUCT_TYPES.map(pt => {
                const qty = invByProduct[pt] || 0
                const maxVal = Math.max(...Object.values(invByProduct), 1)
                const pct = Math.round((qty / maxVal) * 100)
                const color = pt === 'WB' ? '#DC2626' : pt === 'PRC' ? '#D97706' : pt === 'TC' ? '#7C3AED' : '#0891B2'
                return (
                  <div key={pt}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color }}>{pt}</span>
                      <span className="text-xs font-bold text-gray-700">{qty} <span className="text-gray-400 font-normal">Kt</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              Tambah / kelola inventori pengolahan →
            </p>
          </button>
        </div>
      )}
    </div>
  )
}
