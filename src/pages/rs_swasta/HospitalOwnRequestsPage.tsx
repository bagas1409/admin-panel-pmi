import { useState, useEffect, useMemo } from 'react'
import { FileText, Plus, X, Search, Activity, CheckCircle, Clock, Ban, CalendarDays, Archive, Thermometer, Info, User, MoreVertical } from 'lucide-react'
import { getMyBloodRequests, createBloodRequest } from '@/api/hospital'

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
    PENDING: { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    DIPROSES: { label: 'Diproses', cls: 'bg-[#ffe9e9] text-[var(--text-muted)]', dot: 'bg-[#bec6e0]' },
    SIAP_DIAMBIL: { label: 'Siap Diambil', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    SELESAI: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    DITOLAK: { label: 'Ditolak', cls: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
}

const URGENCY_MAP: Record<string, { label: string; cls: string; dot: string }> = {
    NORMAL: { label: 'NORMAL', cls: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
    SEGERA: { label: 'SEGERA', cls: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    DARURAT: { label: 'DARURAT', cls: 'bg-purple-50 text-[var(--primary)] border border-[var(--primary)]/10', dot: 'bg-[var(--primary)] animate-pulse' },
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; cls: string }> = {
    PASIEN: { label: 'Pasien', icon: User, cls: 'bg-blue-50 text-blue-700' },
    STOK_MINIMUM: { label: 'Stok Minimum', icon: Archive, cls: 'bg-amber-50 text-amber-700' },
    PREDIKSI: { label: 'Prediksi', icon: CalendarDays, cls: 'bg-emerald-50 text-emerald-700' },
}

export default function HospitalOwnRequestsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    
    // Modal Detail
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Modal Create
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    
    const [formData, setFormData] = useState({
        kategoriPermintaan: 'PASIEN',
        golonganDarah: 'A',
        jenisProduk: 'WB',
        jumlahKantong: 1,
        tingkatUrgensi: 'NORMAL',
        catatanTambahan: '',
        
        // Khusus PASIEN
        namaPasien: '', noRekamMedis: '', namaDokter: '', alasanMedis: '',
        // Khusus STOK_MINIMUM
        unitLayanan: 'ICU', pemakaianBulanan: '', kasusDarurat: '', fasilitasKulkas: false,
        // Khusus PREDIKSI
        jenisOperasi: '', jadwalOperasi: '', jadwalTransfusiRutin: '', statusCrossmatch: 'Belum'
    })

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const data = await getMyBloodRequests()
            setRequests(data)
        } catch (error) {
            console.error('Failed to fetch requests', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await createBloodRequest(formData)
            alert('Permintaan darah berhasil diajukan!')
            setIsCreateModalOpen(false)
            fetchRequests()
            setFormData({
                ...formData,
                namaPasien: '', noRekamMedis: '', alasanMedis: '', catatanTambahan: '',
                pemakaianBulanan: '', kasusDarurat: '', jadwalOperasi: '', jadwalTransfusiRutin: '', jenisOperasi: ''
            })
        } catch (error: any) {
            alert(error.response?.data?.message || 'Terjadi kesalahan saat mengajukan permintaan.')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const s = searchTerm.toLowerCase()
            const matchSearch = 
                (req.namaPasien?.toLowerCase()?.includes(s) || false) || 
                (req.noRekamMedis?.toLowerCase()?.includes(s) || false) ||
                (req.kategoriPermintaan?.toLowerCase()?.includes(s) || false)
            
            let matchDate = true
            const reqDate = new Date(req.requestedAt)
            reqDate.setHours(0, 0, 0, 0)
            
            if (startDate) {
                const sDate = new Date(startDate)
                sDate.setHours(0, 0, 0, 0)
                if (reqDate < sDate) matchDate = false
            }
            if (endDate) {
                const eDate = new Date(endDate)
                eDate.setHours(23, 59, 59, 999)
                if (reqDate > eDate) matchDate = false
            }
            
            return matchSearch && matchDate
        }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    }, [requests, startDate, endDate, searchTerm])

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="bg-[var(--background)] min-h-screen -m-6 p-6">
            <style>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(149, 0, 42, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(149, 0, 42, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(149, 0, 42, 0); }
                }
                .pulse-critical { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
            `}</style>
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-[var(--primary)] tracking-tight leading-tight">Riwayat Permintaan Darah</h1>
                        <p className="text-sm text-[var(--text-muted)] max-w-xl">
                            Monitor and manage blood supply requests across hospital units. Ensure critical stock levels are maintained through clinical foresight and precise patient-matched ordering.
                        </p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-bold hover:bg-[var(--primary-dark)] transition-all shadow-sm">
                        <Plus className="w-4 h-4" /> Buat Permintaan Baru
                    </button>
                </div>

                {/* Filters */}
                <section className="glass-panel p-4 rounded-2xl shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]/60" />
                            <input 
                                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-100/50 border-none rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all text-[var(--text)] font-medium text-sm" 
                                placeholder="Cari berdasarkan Nama Pasien, RM, atau Unit..." 
                            />
                        </div>
                        <div>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100/50 border-none rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all text-[var(--text-muted)] font-medium text-sm" />
                        </div>
                        <div>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100/50 border-none rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none transition-all text-[var(--text-muted)] font-medium text-sm" />
                        </div>
                    </div>
                </section>

                {/* Data Table */}
                <section className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center text-gray-400 animate-pulse">Memuat riwayat permintaan...</div>
                    ) : paginatedRequests.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <Activity className="w-12 h-12 text-[var(--border)] mb-3" />
                            <p className="text-[var(--text-muted)] font-semibold text-lg">Tidak ada riwayat ditemukan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-[var(--background)]/80 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Detail Permintaan</th>
                                        <th className="px-4 py-3 text-center text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Gol. Darah</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Kategori</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Jumlah Unit</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedRequests.map((req) => {
                                        const cat = CATEGORY_MAP[req.kategoriPermintaan] || CATEGORY_MAP.PASIEN
                                        const CatIcon = cat.icon
                                        const badge = req.kategoriPermintaan === 'PASIEN' && req.tingkatUrgensi === 'DARURAT' && req.status === 'PENDING'
                                            ? URGENCY_MAP.DARURAT 
                                            : STATUS_MAP[req.status] || { label: req.status, cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' }

                                        return (
                                            <tr key={req.id} className="hover:bg-[var(--background)]/80 transition-colors group cursor-pointer" onClick={() => setSelectedRequest(req)}>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        {req.kategoriPermintaan === 'PASIEN' && (
                                                            <>
                                                                <span className="font-bold text-[var(--text)] text-sm">{req.namaPasien}</span>
                                                                <span className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider">RM: {req.noRekamMedis}</span>
                                                            </>
                                                        )}
                                                        {req.kategoriPermintaan === 'STOK_MINIMUM' && (
                                                            <>
                                                                <span className="font-bold text-[var(--text)] text-sm">Unit {req.unitLayanan}</span>
                                                                <span className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider">Weekly Top-up</span>
                                                            </>
                                                        )}
                                                        {req.kategoriPermintaan === 'PREDIKSI' && (
                                                            <>
                                                                <span className="font-bold text-[var(--text)] text-sm">{req.jenisOperasi || 'Transfusi Rutin'}</span>
                                                                <span className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider">Forecast: {req.jadwalOperasi ? new Date(req.jadwalOperasi).toLocaleDateString('id-ID') : new Date(req.jadwalTransfusiRutin).toLocaleDateString('id-ID')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <span className="w-8 h-8 flex items-center justify-center bg-rose-100 text-[var(--primary)] font-black rounded-full border border-[var(--primary)]/20 text-xs">
                                                            {req.golonganDarah}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${cat.cls}`}>
                                                        <CatIcon className="w-3 h-3" /> {cat.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-mono font-medium text-[var(--text)] text-sm">
                                                    {req.jumlahKantong} {req.jenisProduk} Units
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${badge.cls}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                                        {badge.label === 'DARURAT' ? 'DARURAT' : STATUS_MAP[req.status]?.label || req.status}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedRequest(req) }} className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-purple-50 rounded-full transition-colors">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="p-6 bg-[var(--background)]/50 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-semibold text-[var(--text-muted)]">Showing {paginatedRequests.length} of {filteredRequests.length} requests</span>
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-[var(--card-bg)] transition-all text-[var(--text-muted)] font-bold text-sm disabled:opacity-50">Prev</button>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg bg-[var(--card-bg)] shadow-sm font-bold text-[var(--primary)] text-sm">{currentPage}</button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-[var(--card-bg)] transition-all text-[var(--text-muted)] font-bold text-sm disabled:opacity-50">Next</button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Create Request Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setIsCreateModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-[var(--card-bg)] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[var(--background)]/50">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--primary)]">Buat Permintaan Baru</h2>
                                <p className="text-[var(--text-muted)] text-xs mt-1">Lengkapi form pengajuan pemenuhan darah ke DC PMI.</p>
                            </div>
                            <button onClick={() => !submitting && setIsCreateModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--card-bg)] rounded-full transition-all shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {/* Kategori Permintaan */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Kategori Permintaan</label>
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                                    {[
                                        { id: 'PASIEN', label: 'PASIEN', icon: User },
                                        { id: 'STOK_MINIMUM', label: 'STOK MINIMUM', icon: Archive },
                                        { id: 'PREDIKSI', label: 'PREDIKSI', icon: CalendarDays }
                                    ].map(cat => {
                                        const Icon = cat.icon
                                        const active = formData.kategoriPermintaan === cat.id
                                        return (
                                            <button key={cat.id} type="button" onClick={() => setFormData({...formData, kategoriPermintaan: cat.id})}
                                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${active ? 'bg-[var(--card-bg)] shadow-sm text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--card-bg)]/50'}`}>
                                                <Icon className="w-4 h-4" /> {cat.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Golongan Darah</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['A', 'B', 'AB', 'O'].map(bt => (
                                            <button key={bt} type="button" onClick={() => setFormData({...formData, golonganDarah: bt})}
                                                className={`h-10 border-2 rounded-xl font-black text-sm transition-all ${formData.golonganDarah === bt ? 'border-[var(--primary)] text-[var(--primary)] bg-purple-50' : 'border-slate-100 text-[var(--text-muted)] hover:border-[var(--primary)]/40'}`}>
                                                {bt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Produk Darah</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['WB', 'PRC', 'TC', 'FFP'].map(pt => (
                                            <button key={pt} type="button" onClick={() => setFormData({...formData, jenisProduk: pt})}
                                                className={`h-10 border-2 rounded-xl font-bold text-xs transition-all ${formData.jenisProduk === pt ? 'border-[var(--primary)] text-[var(--primary)] bg-purple-50' : 'border-slate-100 text-[var(--text-muted)] hover:border-[var(--primary)]/40'}`}>
                                                {pt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Jumlah Kantong</label>
                                    <input type="number" min="1" required value={formData.jumlahKantong} onChange={e => setFormData({...formData, jumlahKantong: parseInt(e.target.value)})}
                                        className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none font-bold text-base text-center" />
                                </div>
                            </div>

                            {/* Section Pasien */}
                            {formData.kategoriPermintaan === 'PASIEN' && (
                                <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Nama Pasien</label>
                                            <input type="text" required value={formData.namaPasien} onChange={e => setFormData({...formData, namaPasien: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">No Rekam Medis</label>
                                            <input type="text" required value={formData.noRekamMedis} onChange={e => setFormData({...formData, noRekamMedis: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-mono font-medium" placeholder="00-00-00" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Dokter Penanggung Jawab</label>
                                            <input type="text" required value={formData.namaDokter} onChange={e => setFormData({...formData, namaDokter: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Tingkat Urgensi</label>
                                            <select value={formData.tingkatUrgensi} onChange={e => setFormData({...formData, tingkatUrgensi: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-bold">
                                                <option value="NORMAL">NORMAL</option>
                                                <option value="SEGERA">SEGERA</option>
                                                <option value="DARURAT">DARURAT (CITO)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Alasan Medis / Diagnosa</label>
                                            <input type="text" required value={formData.alasanMedis} onChange={e => setFormData({...formData, alasanMedis: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-medium" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section Stok Minimum */}
                            {formData.kategoriPermintaan === 'STOK_MINIMUM' && (
                                <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-[#ede9fe] p-6 rounded-2xl flex gap-4 items-start">
                                        <Info className="w-6 h-6 text-[var(--primary)] shrink-0" />
                                        <div>
                                            <p className="font-bold text-[#40000d] text-sm">FIFO Policy Active</p>
                                            <p className="text-[#920029] text-xs mt-1 leading-relaxed">System prioritizes oldest verified units first. Refrigerator must be optimal for cold-chain integrity.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Unit Layanan</label>
                                            <input type="text" required value={formData.unitLayanan} onChange={e => setFormData({...formData, unitLayanan: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Status Refrigerator</label>
                                            <select required value={formData.fasilitasKulkas ? '1' : '0'} onChange={e => setFormData({...formData, fasilitasKulkas: e.target.value === '1'})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-bold">
                                                <option value="1">Stable (Tersedia & Termonitor)</option>
                                                <option value="0">Tidak Memadai</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Pemakaian Bulanan</label>
                                            <input type="number" required value={formData.pemakaianBulanan} onChange={e => setFormData({...formData, pemakaianBulanan: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Kasus Darurat (per bulan)</label>
                                            <input type="number" required value={formData.kasusDarurat} onChange={e => setFormData({...formData, kasusDarurat: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-medium" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section Prediksi */}
                            {formData.kategoriPermintaan === 'PREDIKSI' && (
                                <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Tipe Prediksi</label>
                                            <select className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-bold" onChange={(e) => {
                                                const v = e.target.value;
                                                setFormData({
                                                    ...formData, 
                                                    jenisOperasi: v === 'OPERASI' ? 'Operasi Umum' : '',
                                                    jadwalOperasi: '', jadwalTransfusiRutin: ''
                                                })
                                            }}>
                                                <option value="OPERASI">Scheduled Surgery Bulk</option>
                                                <option value="RUTIN">Weekly Historical Forecast</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[var(--text-muted)]">Crossmatch Priority</label>
                                            <select required value={formData.statusCrossmatch} onChange={e => setFormData({...formData, statusCrossmatch: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm font-bold">
                                                <option value="Belum">Routine (Belum Crossmatch)</option>
                                                <option value="Sudah">Immediate (Sudah Crossmatch)</option>
                                            </select>
                                        </div>
                                        {formData.jenisOperasi !== '' ? (
                                            <>
                                                <div className="space-y-2"><label className="text-xs font-bold text-[var(--text-muted)]">Jenis Operasi</label><input type="text" required value={formData.jenisOperasi} onChange={e => setFormData({...formData, jenisOperasi: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm" /></div>
                                                <div className="space-y-2"><label className="text-xs font-bold text-[var(--text-muted)]">Jadwal Operasi</label><input type="date" required value={formData.jadwalOperasi} onChange={e => setFormData({...formData, jadwalOperasi: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm" /></div>
                                            </>
                                        ) : (
                                            <div className="space-y-2 col-span-2"><label className="text-xs font-bold text-[var(--text-muted)]">Jadwal Transfusi Rutin</label><input type="date" required value={formData.jadwalTransfusiRutin} onChange={e => setFormData({...formData, jadwalTransfusiRutin: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm" /></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Common Catatan */}
                            <div className="space-y-2 border-t border-slate-100 pt-6">
                                <label className="text-xs font-bold text-[var(--text-muted)]">Catatan Tambahan (Opsional)</label>
                                <textarea rows={3} value={formData.catatanTambahan} onChange={e => setFormData({...formData, catatanTambahan: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)]/40 outline-none text-sm resize-none font-medium" placeholder="Pesan tambahan untuk PMI" />
                            </div>
                        </form>
                        
                        <div className="p-6 border-t border-slate-100 bg-[var(--background)]/50 flex gap-4">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} disabled={submitting} className="flex-1 py-3 border border-slate-200 text-[var(--text-muted)] font-bold rounded-xl hover:bg-[var(--card-bg)] transition-all text-sm">Cancel</button>
                            <button type="submit" disabled={submitting} onClick={handleCreate} className="flex-[2] py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 hover:bg-[#7a0022] active:scale-[0.98] transition-all text-sm">
                                Submit Request
                            </button>
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
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text)] leading-tight">Detail Permintaan</h2>
                                    <p className="text-xs text-[var(--text-muted)]">ID: {selectedRequest.id.split('-')[0]}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 rounded-full hover:bg-[#f9dcdc] flex items-center justify-center transition-colors text-[var(--text-muted)]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="flex gap-4">
                                <div className={`flex-1 p-4 rounded-xl border flex flex-col justify-center ${STATUS_MAP[selectedRequest.status]?.cls || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                    <div className="font-bold uppercase tracking-wider text-sm">{STATUS_MAP[selectedRequest.status]?.label || selectedRequest.status}</div>
                                    <div className="text-[10px] font-bold opacity-80 mt-1">Diajukan: {new Date(selectedRequest.requestedAt).toLocaleString('id-ID')}</div>
                                </div>
                                <div className={`flex-1 p-4 rounded-xl border flex flex-col justify-center ${CATEGORY_MAP[selectedRequest.kategoriPermintaan]?.cls || CATEGORY_MAP.PASIEN.cls}`}>
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Kategori</div>
                                    <div className="font-bold text-sm flex items-center gap-2">
                                        {(() => {
                                            const Icon = CATEGORY_MAP[selectedRequest.kategoriPermintaan]?.icon || Activity;
                                            return <Icon className="w-4 h-4" />
                                        })()}
                                        {CATEGORY_MAP[selectedRequest.kategoriPermintaan]?.label}
                                    </div>
                                </div>
                            </div>

                            {selectedRequest.status === 'DITOLAK' && selectedRequest.alasanTolak && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex gap-3">
                                    <Ban className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-sm mb-1">Ditolak oleh Distribution Center</div>
                                        <div className="text-sm opacity-90 leading-relaxed font-medium">{selectedRequest.alasanTolak}</div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[var(--background)] p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Kebutuhan Darah</div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl font-black text-[var(--primary)]">{selectedRequest.golonganDarah}</span>
                                            <span className="font-bold text-[var(--text)] text-lg">{selectedRequest.jenisProduk}</span>
                                        </div>
                                        <div className="text-sm font-black text-[var(--text-muted)]">{selectedRequest.jumlahKantong} Kantong</div>
                                    </div>
                                    {selectedRequest.kategoriPermintaan === 'PASIEN' && (
                                        <div className="mt-4">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${URGENCY_MAP[selectedRequest.tingkatUrgensi]?.cls || URGENCY_MAP.NORMAL.cls}`}>
                                                Urgensi: {selectedRequest.tingkatUrgensi}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-[var(--background)] p-4 rounded-xl border border-slate-100">
                                    {selectedRequest.kategoriPermintaan === 'PASIEN' && (
                                        <>
                                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Data Pasien</div>
                                            <div className="font-bold text-[var(--text)] truncate text-base">{selectedRequest.namaPasien}</div>
                                            <div className="text-xs font-mono font-bold text-[var(--text-muted)] mt-1">RM: {selectedRequest.noRekamMedis}</div>
                                            <div className="text-xs text-[var(--text)] mt-3 font-bold">Dr. {selectedRequest.namaDokter}</div>
                                        </>
                                    )}
                                    {selectedRequest.kategoriPermintaan === 'STOK_MINIMUM' && (
                                        <>
                                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Data Buffer Stock</div>
                                            <div className="font-bold text-[var(--text)] text-base">Unit: {selectedRequest.unitLayanan}</div>
                                            <div className="text-xs text-[var(--text-muted)] mt-2 font-medium">Pemakaian: <span className="font-bold">{selectedRequest.pemakaianBulanan} ktg/bln</span></div>
                                            <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">Darurat: <span className="font-bold">{selectedRequest.kasusDarurat} kss/bln</span></div>
                                            <div className="text-[10px] flex items-center gap-1 mt-3 text-emerald-600 font-bold bg-emerald-50 p-1.5 rounded"><Thermometer className="w-3 h-3"/> Kulkas {selectedRequest.fasilitasKulkas ? 'Tersedia' : 'Tidak Ada'}</div>
                                        </>
                                    )}
                                    {selectedRequest.kategoriPermintaan === 'PREDIKSI' && (
                                        <>
                                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Detail Prediksi</div>
                                            <div className="font-bold text-[var(--text)] text-base">{selectedRequest.jenisOperasi || 'Transfusi Rutin'}</div>
                                            <div className="text-xs font-bold text-[var(--text-muted)] mt-2">Jadwal: {selectedRequest.jadwalOperasi ? new Date(selectedRequest.jadwalOperasi).toLocaleDateString('id-ID') : new Date(selectedRequest.jadwalTransfusiRutin).toLocaleDateString('id-ID')}</div>
                                            <div className="text-xs text-[var(--text)] mt-2 font-bold">Crossmatch: {selectedRequest.statusCrossmatch}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                {selectedRequest.alasanMedis && (
                                    <div>
                                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Diagnosa / Alasan Medis</div>
                                        <div className="text-sm font-medium text-[var(--text)] leading-relaxed bg-[var(--card-bg)] p-4 rounded-xl border border-slate-200">
                                            {selectedRequest.alasanMedis}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 tracking-wider">Catatan Tambahan</div>
                                    <div className="text-sm font-medium text-[var(--text)] leading-relaxed bg-[var(--card-bg)] p-4 rounded-xl border border-slate-200 italic">
                                        {selectedRequest.catatanTambahan || "Tidak ada catatan tambahan."}
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
