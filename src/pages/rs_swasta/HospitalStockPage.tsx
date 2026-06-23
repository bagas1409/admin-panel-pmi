import { useState, useEffect, useMemo } from 'react'
import { Package, Activity, Droplet, CheckCircle, RefreshCw, Plus, FileText, User, X, AlertTriangle, Clock } from 'lucide-react'
import { getMyBloodStocks, useMyBloodStock, getMyBloodUsages } from '@/api/hospital'
import { Button } from '@/components/ui/Button'

const BLOOD_TYPES = ['A', 'B', 'O', 'AB']
const PRODUCT_TYPES = ['WB', 'PRC', 'TC', 'FFP']

const BT_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
    A: { bg: '#FFEBEE', text: '#D32F2F', border: '#FFCDD2', hex: '#FF4D4D' },
    B: { bg: '#E3F2FD', text: '#1976D2', border: '#BBDEFB', hex: '#3B82F6' },
    O: { bg: '#E8F5E9', text: '#388E3C', border: '#C8E6C9', hex: '#10B981' },
    AB: { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7', hex: '#A855F7' },
}

export default function HospitalStockPage() {
    const [stocks, setStocks] = useState<any[]>([])
    const [usages, setUsages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Analytics Filter
    const [trendFilter, setTrendFilter] = useState<'7days' | '30days' | 'custom'>('30days')
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0])

    // Usage Detail Modal
    const [selectedUsage, setSelectedUsage] = useState<any>(null)

    // Modal Gunakan Darah
    const [isUseModalOpen, setIsUseModalOpen] = useState(false)
    const [useForm, setUseForm] = useState({
        bloodType: 'A', productType: 'WB', quantity: 1,
        namaPasien: '', noRekamMedis: '', namaDokter: '', alasanMedis: ''
    })

    const fetchStocks = async () => {
        setLoading(true)
        try {
            const [data, usageData] = await Promise.all([
                getMyBloodStocks(),
                getMyBloodUsages()
            ])
            setStocks(data)
            setUsages(usageData)
        } catch (error) {
            console.error('Failed to fetch stocks', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStocks()
    }, [])

    const handleUseBlood = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await useMyBloodStock(useForm)
            alert('Penggunaan darah berhasil dicatat!')
            setIsUseModalOpen(false)
            fetchStocks()
            setUseForm({
                bloodType: 'A', productType: 'WB', quantity: 1,
                namaPasien: '', noRekamMedis: '', namaDokter: '', alasanMedis: ''
            })
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal mencatat penggunaan darah.')
        } finally {
            setSaving(false)
        }
    }

    const totalKantong = useMemo(() => stocks.reduce((a, b) => a + (b.quantity || 0), 0), [stocks])

    const criticalStockCount = useMemo(() => stocks.filter(s => s.quantity < 5).length, [stocks])
    
    const todaysUsage = useMemo(() => {
        const today = new Date().toDateString()
        return usages.filter(u => new Date(u.usedAt).toDateString() === today).reduce((a, b) => a + b.quantity, 0)
    }, [usages])

    const storageLoad = Math.min((totalKantong / 1000) * 100, 100).toFixed(1)

    // Compute real usage analytics data
    const filteredUsages = useMemo(() => {
        const now = new Date()
        return usages.filter(u => {
            const uDate = new Date(u.usedAt)
            if (trendFilter === '7days') return (now.getTime() - uDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
            if (trendFilter === '30days') return (now.getTime() - uDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
            if (trendFilter === 'custom') return uDate.toISOString().split('T')[0] === customDate
            return true
        })
    }, [usages, trendFilter, customDate])

    const typeUsage = useMemo(() => {
        const counts = { A: 0, B: 0, O: 0, AB: 0 }
        filteredUsages.forEach(u => { if (counts[u.bloodType as keyof typeof counts] !== undefined) counts[u.bloodType as keyof typeof counts] += u.quantity })
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
        return { counts, total }
    }, [filteredUsages])

    const donutSegments = useMemo(() => {
        const { counts, total } = typeUsage
        let cumulativePercent = 0
        return [
            { type: 'A', color: '#DC2626', count: counts.A },
            { type: 'B', color: '#3B82F6', count: counts.B },
            { type: 'O', color: '#10B981', count: counts.O },
            { type: 'AB', color: '#A855F7', count: counts.AB },
        ].map(item => {
            const percent = total > 1 || counts[item.type as keyof typeof counts] > 0 ? item.count / total : 0
            const dash = percent * 502.6
            const offset = - (cumulativePercent * 502.6)
            cumulativePercent += percent
            return { ...item, percent, dash, offset }
        }).filter(item => item.count > 0)
    }, [typeUsage])

    const productUsage = useMemo(() => {
        const counts = { WB: 0, PRC: 0, TC: 0, FFP: 0 }
        filteredUsages.forEach(u => { if (counts[u.productType as keyof typeof counts] !== undefined) counts[u.productType as keyof typeof counts] += u.quantity })
        const max = Math.max(...Object.values(counts), 1)
        return { counts, max }
    }, [filteredUsages])

    const topDonutType = [...donutSegments].sort((a, b) => b.count - a.count)[0]

    return (
        <div className="space-y-8 bg-[#fff8f7] -m-6 p-6 min-h-screen">
            <style>{`
                .liquid-animation { animation: liquid-swell 4s ease-in-out infinite; }
                @keyframes liquid-swell {
                    0%, 100% { transform: translateY(0) scaleY(1); }
                    50% { transform: translateY(-2px) scaleY(1.05); }
                }
                .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    80%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[32px] leading-10 font-bold text-[var(--text)] tracking-tight">Inventory Matrix</h1>
                    <p className="text-[var(--text-muted)] mt-1">Real-time monitoring of blood components and stock levels.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsUseModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--primary-dark)] transition-all shadow-sm">
                        <Plus className="w-4 h-4" /> Emergency Request
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Stock */}
                <div className="bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Units</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-[48px] leading-tight font-bold text-[var(--primary)]">{totalKantong}</h4>
                        <div className="flex items-center text-[#00524b] font-bold text-xs">
                            <Activity className="w-4 h-4 mr-1" /> Active
                        </div>
                    </div>
                    <div className="mt-4 h-1 bg-[#ffe9e9] rounded-full overflow-hidden">
                        <div className="w-[75%] h-full bg-[var(--primary)] rounded-full"></div>
                    </div>
                </div>

                {/* Critical Alerts */}
                <div className="bg-[var(--card-bg)] border border-[var(--primary-dark)]/20 p-6 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all relative">
                    {criticalStockCount > 0 && (
                        <div className="absolute -top-1 -right-1 flex">
                            <span className="w-3 h-3 bg-[var(--primary-dark)] rounded-full relative z-10"></span>
                            <span className="absolute w-3 h-3 bg-[var(--primary-dark)] rounded-full pulse-ring opacity-75"></span>
                        </div>
                    )}
                    <p className="text-xs font-bold text-[var(--primary-dark)] uppercase tracking-wider mb-2">Critical Stock</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-[48px] leading-tight font-bold text-[var(--text)]">{String(criticalStockCount).padStart(2, '0')}</h4>
                        {criticalStockCount > 0 && <span className="bg-[#ffdad6] text-[var(--primary-dark)] px-2 py-0.5 rounded text-[10px] font-bold">URGENT</span>}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-4">{criticalStockCount > 0 ? 'Beberapa komponen berada di bawah batas aman' : 'Semua komponen dalam batas aman'}</p>
                </div>

                {/* Today's Usage */}
                <div className="bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Today's Usage</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-[48px] leading-tight font-bold text-[var(--text)]">{todaysUsage}</h4>
                        <div className="w-16 h-8">
                            <svg className="w-full h-full stroke-[var(--primary)] fill-none stroke-2" viewBox="0 0 100 40">
                                <path d="M0,35 Q10,10 20,30 T40,20 T60,35 T80,10 T100,25"></path>
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-4">Kantong digunakan hari ini</p>
                </div>

                {/* Capacity */}
                <div className="bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Storage Load</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-[48px] leading-tight font-bold text-[var(--text)]">{storageLoad}%</h4>
                        <span className="text-[var(--text-muted)]"><Package className="w-6 h-6" /></span>
                    </div>
                    <div className="mt-4 h-1 bg-[#ffe9e9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#565e74] rounded-full" style={{ width: `${storageLoad}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Matrix Stok */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="lg:col-span-4 py-20 text-center text-[var(--text-muted)] animate-pulse font-bold">Memuat data stok matriks...</div>
                ) : (
                    <>
                            {BLOOD_TYPES.map(bt => {
                                const c = BT_COLORS[bt]
                                
                                // Calculate total stock for this blood type to determine status
                                const totalTypeStock = PRODUCT_TYPES.reduce((acc, pt) => {
                                    const s = stocks.find(st => st.bloodType === bt && st.productType === pt)
                                    return acc + (s ? s.quantity : 0)
                                }, 0)
                                
                                let status = 'OPTIMAL'
                                let statusColor = 'bg-[#10B981]/10 text-[#10B981]'
                                if (totalTypeStock < 10) { status = 'CRITICAL'; statusColor = 'bg-[var(--primary-dark)]/10 text-[var(--primary-dark)]' }
                                else if (totalTypeStock < 25) { status = 'WARNING'; statusColor = 'bg-amber-100 text-amber-700' }

                                return (
                                    <div key={bt} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 flex flex-col space-y-8 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm" style={{ backgroundColor: c.hex }}>
                                                    {bt}
                                                </div>
                                                <h3 className="font-bold text-[20px] text-[var(--text)]">Type {bt}</h3>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>
                                                {status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {PRODUCT_TYPES.map(pt => {
                                                const stockItem = stocks.find(s => s.bloodType === bt && s.productType === pt)
                                                const qty = stockItem ? stockItem.quantity : 0
                                                const isCritical = qty < 5
                                                const fillPercent = Math.min((qty / 50) * 100, 100)
                                                
                                                return (
                                                    <div key={pt} className="flex flex-col items-center">
                                                        <div className="relative w-full h-24 bg-[var(--background)] rounded-xl border border-[var(--border)]/50 overflow-hidden mb-2 group">
                                                            {/* Blood Bag Fill Visualization */}
                                                            <div className={`absolute bottom-0 w-full ${isCritical ? 'bg-gradient-to-t from-[var(--primary-dark)] to-[#ffdad6]' : 'bg-gradient-to-t from-[var(--primary)] to-[#ffb2b7]'} transition-all duration-1000 liquid-animation`} 
                                                                 style={{ height: `${fillPercent}%` }}>
                                                                <div className="absolute top-0 w-full h-2 bg-[var(--card-bg)]/30 blur-[1px]"></div>
                                                            </div>
                                                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-[var(--text)] mix-blend-overlay opacity-20">
                                                                {pt}
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-black text-[var(--text)] text-lg">{qty}<span className="text-[10px] font-normal text-[var(--text-muted)] ml-0.5">U</span></p>
                                                            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">{pt}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                    </>
                )}
            </div>

            {stocks.length > 0 && (
                <div className="text-xs text-gray-400 flex justify-end items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Pembaruan terakhir: {new Date(Math.max(...stocks.map(s => new Date(s.lastUpdated).getTime()))).toLocaleString('id-ID')}
                </div>
            )}

            {/* Analytics & Usage Feed Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Dynamic Analytics Panel */}
                <div className="xl:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 hidden md:flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[24px] text-[var(--text)]">Distribution & Trends</h3>
                        <div className="flex items-center gap-2">
                            {trendFilter === 'custom' && (
                                <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} className="text-sm font-bold text-[var(--text-muted)] bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 rounded-lg outline-none" />
                            )}
                            <select value={trendFilter} onChange={e => setTrendFilter(e.target.value as any)} className="text-sm font-bold text-[var(--text-muted)] bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 rounded-lg outline-none cursor-pointer">
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="custom">Custom Date</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-[250px]">
                        <div className="flex flex-col items-center justify-center border-r border-[var(--border)]/30">
                            {donutSegments.length === 0 ? (
                                <div className="text-[var(--text-muted)] font-bold text-center">Belum ada data<br/>pada periode ini</div>
                            ) : (
                                <div className="relative w-48 h-48 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle className="text-[#f9dcdc]" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="16"></circle>
                                        {donutSegments.map(seg => (
                                            <circle key={seg.type} cx="96" cy="96" fill="transparent" r="80" stroke={seg.color} strokeWidth="16" strokeDasharray={`${seg.dash} 502.6`} strokeDashoffset={seg.offset} className="transition-all duration-1000"></circle>
                                        ))}
                                    </svg>
                                    <div className="absolute text-center">
                                        <p className="text-2xl font-bold text-[var(--text)]">Type {topDonutType?.type}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{Math.round((topDonutType?.percent || 0) * 100)}% Total</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-end space-y-2 pt-6 pb-6 relative">
                            <div className="absolute top-0 left-0 text-xs font-bold text-[var(--text-muted)]">Total Penggunaan per Produk</div>
                            <div className="flex items-end gap-4 h-full px-6">
                                {PRODUCT_TYPES.map(pt => {
                                    const count = productUsage.counts[pt as keyof typeof productUsage.counts]
                                    const h = (count / productUsage.max) * 100
                                    return (
                                        <div key={pt} className="flex-1 bg-[var(--primary)]/10 rounded-t-lg relative h-full flex items-end group">
                                            <div className="w-full bg-gradient-to-t from-[var(--primary)] to-[#ffb2b7] rounded-t-lg transition-all duration-1000 relative flex justify-center" style={{ height: `${Math.max(h, 2)}%` }}>
                                                <span className="absolute -top-6 text-xs font-bold text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                                            </div>
                                            <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold text-[var(--text-muted)]">{pt}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Usage Feed */}
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 flex flex-col xl:col-span-1 min-h-[400px] max-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[24px] text-[var(--text)]">Live Usage Feed</h3>
                        <Activity className="w-5 h-5 text-[var(--primary)] pulse-ring" />
                    </div>
                    
                    {filteredUsages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <FileText className="w-12 h-12 text-[var(--border)] mb-3" />
                            <p className="text-[var(--text-muted)] font-semibold">Belum ada riwayat penggunaan</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {filteredUsages.map(u => {
                                const initials = u.namaPasien.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                const colorClass = u.bloodType === 'O' ? 'bg-[#10B981] text-white' : 
                                                   u.bloodType === 'A' ? 'bg-[#DC2626] text-white' : 
                                                   u.bloodType === 'B' ? 'bg-[#3B82F6] text-white' : 
                                                   'bg-[#A855F7] text-white'

                                return (
                                    <div key={u.id} onClick={() => setSelectedUsage(u)} className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--background)] transition-all border border-transparent hover:border-[var(--border)]/50 cursor-pointer group">
                                        <div className="w-10 h-10 rounded-full bg-[#ede9fe] flex items-center justify-center font-bold text-[#40000d] text-sm shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="font-bold text-[var(--text)] truncate pr-2">{u.namaPasien} <span className="font-normal text-[var(--text-muted)] text-xs">({u.noRekamMedis})</span></p>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${colorClass}`}>
                                                    {u.bloodType} {u.productType}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)]">{u.quantity} units administered</p>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(u.usedAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} • {u.namaDokter}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Gunakan Darah */}
            {isUseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--text)]/40 backdrop-blur-sm transition-opacity" onClick={() => !saving && setIsUseModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-[var(--card-bg)] rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-6 bg-[var(--background)] border-b border-[var(--border)] flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)]">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-[24px] font-bold text-[var(--text)] leading-tight">Gunakan Darah</h2>
                                    <p className="text-sm text-[var(--text-muted)]">Log medication/blood usage to patient records</p>
                                </div>
                            </div>
                            <button onClick={() => !saving && setIsUseModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-[#f9dcdc] flex items-center justify-center transition-colors text-[var(--text-muted)]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUseBlood} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold tracking-widest text-[var(--text-muted)] mb-2 uppercase">Nama Pasien / RM *</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" required value={useForm.namaPasien} onChange={e => setUseForm({...useForm, namaPasien: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none font-medium" placeholder="Nama lengkap pasien" />
                                        <input type="text" required value={useForm.noRekamMedis} onChange={e => setUseForm({...useForm, noRekamMedis: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none font-mono font-medium" placeholder="No. Rekam Medis" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold tracking-widest text-[var(--text-muted)] mb-2 uppercase">Golongan Darah *</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {BLOOD_TYPES.map(bt => (
                                            <button key={bt} type="button" onClick={() => setUseForm({...useForm, bloodType: bt})} 
                                                className={`py-3 rounded-xl border font-black text-xs transition-all ${useForm.bloodType === bt ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[#ede9fe]'}`}>
                                                {bt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold tracking-widest text-[var(--text-muted)] mb-2 uppercase">Jml Kantong *</label>
                                    <div className="flex items-center">
                                        <button type="button" onClick={() => setUseForm({...useForm, quantity: Math.max(1, useForm.quantity - 1)})} className="w-12 h-[42px] bg-[var(--background)] border border-[var(--border)] rounded-l-xl flex items-center justify-center hover:bg-[#f9dcdc] text-lg font-bold text-[var(--text-muted)]">-</button>
                                        <input type="number" min="1" max="20" required value={useForm.quantity} onChange={e => setUseForm({...useForm, quantity: parseInt(e.target.value) || 1})} className="w-full h-[42px] border-y border-[var(--border)] text-center font-black focus:ring-0 outline-none text-[var(--text)]" />
                                        <button type="button" onClick={() => setUseForm({...useForm, quantity: Math.min(20, useForm.quantity + 1)})} className="w-12 h-[42px] bg-[var(--background)] border border-[var(--border)] rounded-r-xl flex items-center justify-center hover:bg-[#f9dcdc] text-lg font-bold text-[var(--text-muted)]">+</button>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-bold tracking-widest text-[var(--text-muted)] mb-2 uppercase">Produk Darah *</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {PRODUCT_TYPES.map(pt => (
                                            <button key={pt} type="button" onClick={() => setUseForm({...useForm, productType: pt})} 
                                                className={`py-4 rounded-xl border font-bold text-xs transition-all ${useForm.productType === pt ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[#ede9fe]'}`}>
                                                {pt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-bold tracking-widest text-[var(--text-muted)] mb-2 uppercase">Informasi Medis *</label>
                                    <div className="space-y-4">
                                        <input type="text" required value={useForm.namaDokter} onChange={e => setUseForm({...useForm, namaDokter: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none font-medium" placeholder="Nama Dokter Penanggung Jawab" />
                                        <input type="text" required value={useForm.alasanMedis} onChange={e => setUseForm({...useForm, alasanMedis: e.target.value})} className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none font-medium" placeholder="Alasan Medis / Diagnosa (Indikasi Transfusi)" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4 mt-4">
                                <button type="button" onClick={() => setIsUseModalOpen(false)} disabled={saving} className="flex-1 py-4 border border-[var(--border)] text-[var(--text-muted)] rounded-xl font-bold hover:bg-[var(--background)] transition-all">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-4 bg-[var(--primary)] text-white rounded-xl font-bold hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm Usage'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Usage */}
            {selectedUsage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--text)]/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUsage(null)}></div>
                    <div className="relative w-full max-w-lg bg-[var(--card-bg)] rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-6 bg-[var(--background)] border-b border-[var(--border)] flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)]">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text)] leading-tight">Detail Penggunaan</h2>
                                    <p className="text-xs text-[var(--text-muted)]">Catatan Rekam Medis Transfusi</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUsage(null)} className="w-10 h-10 rounded-full hover:bg-[#f9dcdc] flex items-center justify-center transition-colors text-[var(--text-muted)]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Pasien Info */}
                            <div className="flex items-center gap-4 p-4 bg-[#f9dcdc]/30 rounded-xl border border-[var(--border)]/50">
                                <div className="w-14 h-14 rounded-full bg-[#ede9fe] flex items-center justify-center font-black text-[var(--primary)] text-xl shrink-0">
                                    {selectedUsage.namaPasien.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[18px] text-[var(--text)]">{selectedUsage.namaPasien}</p>
                                    <p className="text-sm font-mono font-semibold text-[var(--text-muted)]">RM: {selectedUsage.noRekamMedis}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1.5 rounded-lg font-black text-white text-lg ${
                                        selectedUsage.bloodType === 'O' ? 'bg-[#10B981]' : 
                                        selectedUsage.bloodType === 'A' ? 'bg-[#DC2626]' : 
                                        selectedUsage.bloodType === 'B' ? 'bg-[#3B82F6]' : 'bg-[#A855F7]'
                                    }`}>
                                        {selectedUsage.bloodType} <span className="text-xs">{selectedUsage.productType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card-bg)]">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Jumlah Kantong</p>
                                    <p className="text-2xl font-black text-[var(--primary)]">{selectedUsage.quantity} <span className="text-xs font-bold text-[var(--text-muted)]">Unit</span></p>
                                </div>
                                <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card-bg)]">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Waktu Transfusi</p>
                                    <p className="text-sm font-bold text-[var(--text)] mt-1">{new Date(selectedUsage.usedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                                <div className="col-span-2 p-4 border border-[var(--border)] rounded-xl bg-[var(--card-bg)]">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Dokter Penanggung Jawab</p>
                                    <p className="text-sm font-bold text-[var(--text)] flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4 text-[var(--primary)]" /> {selectedUsage.namaDokter}
                                    </p>
                                </div>
                                <div className="col-span-2 p-4 border border-[var(--border)] rounded-xl bg-[var(--card-bg)] bg-[var(--background)]">
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Alasan Medis / Diagnosa</p>
                                    <p className="text-sm font-medium text-[var(--text)] italic">"{selectedUsage.alasanMedis}"</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex">
                            <button onClick={() => setSelectedUsage(null)} className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold hover:shadow-xl transition-all">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
