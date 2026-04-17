import { useEffect, useState, FormEvent } from 'react'
import { Droplet, MapPin, Activity, Settings2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import api from '@/api/axios'
import type { Region } from '@/types'

// Semua tipe produk darah yang dikenal
const PRODUCT_TYPES = [
    { code: 'WB',  label: 'Whole Blood',           short: 'WB' },
    { code: 'PRC', label: 'Packed Red Cells',       short: 'PRC' },
    { code: 'TC',  label: 'Thrombocyte Concentrate',short: 'TC' },
    { code: 'FFP', label: 'Fresh Frozen Plasma',    short: 'FFP' },
    { code: 'AHF', label: 'Anti Haemophilic Factor',short: 'AHF' },
    { code: 'LP',  label: 'Leukocyte Poor',         short: 'LP' },
]

const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const
type BloodType = typeof BLOOD_TYPES[number]

// Warna per golongan darah
const BLOOD_COLORS: Record<BloodType, { bg: string; text: string; border: string }> = {
    A:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    B:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    O:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    AB: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
}

interface BloodStock {
    id: string
    bloodType: BloodType
    productType: string
    quantity: number
    updatedAt: string
}

interface RegionWithStock extends Region {
    bloodStocks: BloodStock[]
}

interface DashboardStats {
    totalA: number
    totalB: number
    totalAB: number
    totalO: number
    totalRegions: number
    regions: RegionWithStock[]
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalA: 0, totalB: 0, totalAB: 0, totalO: 0, totalRegions: 0, regions: [],
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Expanded rows (per region detail per bloodtype)
    const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())

    // Form Modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedRegionId, setSelectedRegionId] = useState<string>('')
    const [savingStock, setSavingStock] = useState(false)
    const [stockForm, setStockForm] = useState({
        bloodType: 'A',
        productType: 'WB',
        quantity: 0
    })

    const fetchDashboardData = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data } = await api.get('/blood-stocks')
            const regionsData: RegionWithStock[] = data.data

            let countA = 0, countB = 0, countAB = 0, countO = 0
            regionsData.forEach(region => {
                region.bloodStocks.forEach(stock => {
                    if (stock.bloodType === 'A')  countA  += stock.quantity
                    if (stock.bloodType === 'B')  countB  += stock.quantity
                    if (stock.bloodType === 'AB') countAB += stock.quantity
                    if (stock.bloodType === 'O')  countO  += stock.quantity
                })
            })

            if (regionsData.length > 0 && !selectedRegionId) {
                setSelectedRegionId(regionsData[0].id)
            }

            setStats({
                totalA: countA, totalB: countB, totalAB: countAB, totalO: countO,
                totalRegions: regionsData.length, regions: regionsData
            })
        } catch (err: any) {
            console.error(err)
            setError(err?.response?.data?.message || 'Gagal memuat matriks persediaan darah UI.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDashboardData() }, [])

    const handleSaveStock = async (e: FormEvent) => {
        e.preventDefault()
        setSavingStock(true)
        try {
            await api.post('/blood-stocks/upsert', {
                regionId: selectedRegionId,
                bloodType: stockForm.bloodType,
                productType: stockForm.productType,
                quantity: Number(stockForm.quantity)
            })
            setIsModalOpen(false)
            fetchDashboardData()
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal menyimpan update stok darah')
        } finally {
            setSavingStock(false)
        }
    }

    const toggleRegion = (id: string) => {
        setExpandedRegions(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    // Helper: Hitung qty per golongan & per tipe produk untuk satu region
    const getStockMatrix = (stocks: BloodStock[]) => {
        // { A: { WB: 12, PRC: 5, ... }, B: {...}, ... }
        const matrix: Record<string, Record<string, number>> = {}
        for (const bt of BLOOD_TYPES) {
            matrix[bt] = {}
            for (const pt of PRODUCT_TYPES) {
                matrix[bt][pt.code] = 0
            }
        }
        stocks.forEach(s => {
            if (matrix[s.bloodType]) {
                matrix[s.bloodType][s.productType] = (matrix[s.bloodType][s.productType] || 0) + s.quantity
            }
        })
        return matrix
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">Dashboard Ketersediaan</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Pemantauan matriks plasma darah <em>real-time</em> UDD PMI Pringsewu</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2 rounded-xl flex items-center text-sm font-semibold shadow-sm transition-colors cursor-pointer">
                        <Settings2 className="w-4 h-4 mr-2 text-gray-600" /> Modulator Stok (Admin)
                    </button>
                    <div className="bg-red-50 text-[var(--primary)] px-4 py-2 rounded-xl border border-red-100 flex items-center text-sm font-semibold shadow-sm">
                        <Activity className="w-4 h-4 mr-2 animate-pulse" /> Live Status
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium">{error}</div>
            )}

            {/* ── STAT CARDS — Ringkasan Total per Golongan ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {BLOOD_TYPES.map(bt => {
                    const totalKey = `total${bt}` as 'totalA' | 'totalB' | 'totalAB' | 'totalO'
                    const c = BLOOD_COLORS[bt]
                    return (
                        <div key={bt} className="rounded-2xl p-5 border flex items-center gap-4 shadow-sm" style={{ backgroundColor: c.bg, borderColor: c.border }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl" style={{ backgroundColor: c.border, color: c.text }}>
                                {bt}
                            </div>
                            <div>
                                {loading ? (
                                    <div className="h-7 w-16 bg-white/60 rounded animate-pulse" />
                                ) : (
                                    <div className="text-2xl font-extrabold" style={{ color: c.text }}>{stats[totalKey]} <span className="text-sm font-semibold opacity-70">Kt</span></div>
                                )}
                                <div className="text-xs font-semibold mt-0.5 opacity-70" style={{ color: c.text }}>Golongan {bt} (semua tipe)</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── TABEL DETAIL per CABANG ── */}
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[var(--border)] flex gap-2 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="text-[var(--primary)] w-5 h-5"/>
                        <h3 className="text-lg font-bold text-[var(--text)]">Sebaran Stok per Cabang UDD</h3>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Ketuk baris untuk melihat rincian tipe produk</p>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">Memuat matriks darah...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[var(--border)]">
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Cabang UDD</th>
                                    {BLOOD_TYPES.map(bt => (
                                        <th key={bt} className="px-4 py-3 text-xs font-bold text-center uppercase" style={{ color: BLOOD_COLORS[bt].text }}>
                                            Gol {bt}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 text-center uppercase">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.regions.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Belum ada pasokan darah terdaftar.</td></tr>
                                ) : (
                                    stats.regions.map((region) => {
                                        const matrix = getStockMatrix(region.bloodStocks)
                                        const isExpanded = expandedRegions.has(region.id)
                                        // Hitung total per golongan darah
                                        const totals: Record<string, number> = {}
                                        for (const bt of BLOOD_TYPES) {
                                            totals[bt] = Object.values(matrix[bt]).reduce((a, b) => a + b, 0)
                                        }

                                        return (
                                            <>
                                                {/* Baris Ringkasan */}
                                                <tr
                                                    key={region.id}
                                                    className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-[var(--border)]"
                                                    onClick={() => toggleRegion(region.id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900 text-sm">{region.name}</div>
                                                        <div className="text-xs text-gray-400 line-clamp-1">{region.address}</div>
                                                    </td>
                                                    {BLOOD_TYPES.map(bt => {
                                                        const total = totals[bt]
                                                        const c = BLOOD_COLORS[bt]
                                                        return (
                                                            <td key={bt} className="px-4 py-4 text-center">
                                                                <span
                                                                    className="inline-block min-w-[2.5rem] px-2 py-1 rounded-lg text-sm font-bold"
                                                                    style={{
                                                                        backgroundColor: total > 0 ? c.bg : '#F9FAFB',
                                                                        color: total > 0 ? c.text : '#9CA3AF',
                                                                        border: `1px solid ${total > 0 ? c.border : '#E5E7EB'}`
                                                                    }}
                                                                >
                                                                    {total}
                                                                </span>
                                                            </td>
                                                        )
                                                    })}
                                                    <td className="px-4 py-4 text-center text-gray-400">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 mx-auto" /> : <ChevronDown className="w-4 h-4 mx-auto" />}
                                                    </td>
                                                </tr>

                                                {/* Baris Detail per Tipe Produk (jika expanded) */}
                                                {isExpanded && (
                                                    <tr key={`${region.id}-detail`} className="bg-gray-50/70 border-b border-[var(--border)]">
                                                        <td className="px-6 py-4" colSpan={6}>
                                                            <div className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Rincian per Tipe Produk</div>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="text-left text-xs text-gray-400 font-semibold pb-2 w-48">Tipe Produk</th>
                                                                            {BLOOD_TYPES.map(bt => (
                                                                                <th key={bt} className="text-center text-xs font-bold pb-2 w-20" style={{ color: BLOOD_COLORS[bt].text }}>
                                                                                    Gol {bt}
                                                                                </th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {PRODUCT_TYPES.map(pt => {
                                                                            const rowTotal = BLOOD_TYPES.reduce((sum, bt) => sum + (matrix[bt][pt.code] || 0), 0)
                                                                            // Sembunyikan baris jika semua 0
                                                                            if (rowTotal === 0) return null
                                                                            return (
                                                                                <tr key={pt.code}>
                                                                                    <td className="py-2 pr-4">
                                                                                        <span className="font-mono font-bold text-gray-700 text-xs bg-white border border-gray-200 px-2 py-0.5 rounded">{pt.short}</span>
                                                                                        <span className="text-gray-400 text-xs ml-2">{pt.label}</span>
                                                                                    </td>
                                                                                    {BLOOD_TYPES.map(bt => {
                                                                                        const qty = matrix[bt][pt.code] || 0
                                                                                        const c = BLOOD_COLORS[bt]
                                                                                        return (
                                                                                            <td key={bt} className="py-2 text-center">
                                                                                                {qty > 0 ? (
                                                                                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                                                                                                        {qty} Kt
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="text-gray-300 text-xs">—</span>
                                                                                                )}
                                                                                            </td>
                                                                                        )
                                                                                    })}
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── MODAL MODULATOR FORM ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-[var(--primary)]" />
                                Modulasi Manual Stok Darah
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveStock} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cabang UDD</label>
                                <select
                                    value={selectedRegionId}
                                    onChange={(e) => setSelectedRegionId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm"
                                >
                                    {stats.regions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Golongan Darah</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {BLOOD_TYPES.map(bt => (
                                            <button
                                                key={bt}
                                                type="button"
                                                onClick={() => setStockForm({ ...stockForm, bloodType: bt })}
                                                className="py-2 rounded-xl border text-sm font-bold transition-all"
                                                style={stockForm.bloodType === bt
                                                    ? { backgroundColor: BLOOD_COLORS[bt].bg, color: BLOOD_COLORS[bt].text, borderColor: BLOOD_COLORS[bt].text }
                                                    : { backgroundColor: '#fff', color: '#9CA3AF', borderColor: '#E5E7EB' }
                                                }
                                            >
                                                {bt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Produk</label>
                                    <select
                                        value={stockForm.productType}
                                        onChange={(e) => setStockForm({ ...stockForm, productType: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm"
                                    >
                                        {PRODUCT_TYPES.map(pt => (
                                            <option key={pt.code} value={pt.code}>{pt.short} — {pt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Pratinjau terpilih */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: BLOOD_COLORS[stockForm.bloodType as BloodType]?.bg, borderColor: BLOOD_COLORS[stockForm.bloodType as BloodType]?.border }}>
                                <Droplet className="w-5 h-5" style={{ color: BLOOD_COLORS[stockForm.bloodType as BloodType]?.text }} />
                                <div className="text-sm font-semibold" style={{ color: BLOOD_COLORS[stockForm.bloodType as BloodType]?.text }}>
                                    Golongan {stockForm.bloodType} · {PRODUCT_TYPES.find(p => p.code === stockForm.productType)?.label}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah Kantong</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={stockForm.quantity}
                                    onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                <Button type="submit" loading={savingStock}>Terapkan Pembaruan</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
