import { useEffect, useState, FormEvent } from 'react'
import { MapPin, Plus, Edit2, Trash2, X, Users, CheckCircle, XCircle } from 'lucide-react'
import { regionService } from '@/api/region'
import type { Region } from '@/types'
import { Button } from '@/components/ui/Button'

export default function RegionsPage() {
    const [regions, setRegions] = useState<Region[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<{name: string, address: string, latitude: number | string, longitude: number | string}>({ name: '', address: '', latitude: '', longitude: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Participant Modal State
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false)
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
    const [participants, setParticipants] = useState<any[]>([])
    const [loadingParticipants, setLoadingParticipants] = useState(false)
    const [verifyingId, setVerifyingId] = useState<string | null>(null)

    const fetchRegions = async () => {
        setLoading(true)
        try {
            const data = await regionService.getAll()
            setRegions(data)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Gagal memuat data Cabang UDD')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRegions()
    }, [])

    const handleOpenModal = (region?: Region) => {
        if (region) {
            setEditingId(region.id)
            setFormData({ name: region.name, address: region.address, latitude: region.latitude ?? '', longitude: region.longitude ?? '' })
        } else {
            setEditingId(null)
            setFormData({ name: '', address: '', latitude: '', longitude: '' })
        }
        setIsModalOpen(true)
    }

    const handleHapus = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus Cabang UDD ini? Seluruh riwayat dan stok terkait mungkin terdampak.')) return
        try {
            await regionService.delete(id)
            fetchRegions()
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal menghapus UDD')
        }
    }

    const openParticipantsModal = async (regionId: string) => {
        setSelectedRegionId(regionId)
        setIsParticipantsModalOpen(true)
        setLoadingParticipants(true)
        try {
            const data = await regionService.getRegistrants(regionId)
            setParticipants(data)
        } catch (err: any) {
            alert('Gagal memuat peserta')
        } finally {
            setLoadingParticipants(false)
        }
    }

    const updateParticipantStatus = async (registrationId: string, status: 'ATTENDED' | 'ABSENT') => {
        if (!confirm(`Konfirmasi set status pendaftar menjadi ${status}?`)) return
        setVerifyingId(registrationId)
        try {
            await regionService.updateRegistrant(registrationId, status)
            // Reload list lokal
            if (selectedRegionId) {
                const refreshed = await regionService.getRegistrants(selectedRegionId)
                setParticipants(refreshed)
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal memperbarui status')
        } finally {
            setVerifyingId(null)
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        let latVal = formData.latitude === '' || isNaN(Number(formData.latitude)) ? null : parseFloat(String(formData.latitude));
        let lonVal = formData.longitude === '' || isNaN(Number(formData.longitude)) ? null : parseFloat(String(formData.longitude));

        // Frontend Validation
        if (latVal !== null && (latVal < -90 || latVal > 90)) {
            alert('Latitude tidak valid! Harus berada di antara -90 dan 90.');
            return;
        }
        if (lonVal !== null && (lonVal < -180 || lonVal > 180)) {
            alert('Longitude tidak valid! Harus berada di antara -180 dan 180.');
            return;
        }

        setIsSubmitting(true)
        try {
            // Kita strip null supaya Zod.optional() di backend tidak komplain kalau nerima null alih-alih undefined.
            const payload: any = { 
                ...formData,
                latitude: latVal !== null ? latVal : undefined,
                longitude: lonVal !== null ? lonVal : undefined
            }
            if (payload.latitude === undefined) delete payload.latitude;
            if (payload.longitude === undefined) delete payload.longitude;
            if (editingId) {
                await regionService.update(editingId, payload)
            } else {
                await regionService.create(payload)
            }
            setIsModalOpen(false)
            fetchRegions()
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal menyimpan data')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)]">Manajemen UDD & Wilayah</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Kelola daftar cabang Palang Merah dan lokasi fisiknya</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus className="w-5 h-5"/> Tambah UDD
                </Button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

            <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-[var(--border)] text-gray-500 uppercase text-xs tracking-wider">
                            <th className="px-6 py-4 font-bold">Kode UDD</th>
                            <th className="px-6 py-4 font-bold">Nama Cabang / Identitas</th>
                            <th className="px-6 py-4 font-bold">Alamat Lengkap</th>
                            <th className="px-6 py-4 font-bold">Koordinat (Lat, Lng)</th>
                            <th className="px-6 py-4 font-bold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading data cabang...</td></tr>
                        ) : regions.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada Cabang UDD terdaftar.</td></tr>
                        ) : (
                            regions.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="bg-red-50 text-red-700 font-bold px-2 py-1 rounded inline-block text-xs border border-red-100">
                                            {r.kodeUdd || 'NEW'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3 items-center">
                                            <div className="flex bg-red-100 p-2 rounded-lg text-[var(--primary)] text-xs font-bold w-10 h-10 justify-center items-center shadow-inner">
                                                PMI
                                            </div>
                                            <div className="font-semibold text-gray-800">{r.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{r.address}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">[{r.latitude}, {r.longitude}]</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openParticipantsModal(r.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Verifikasi Pendaftar Markas">
                                                <Users className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleOpenModal(r)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Markas"><Edit2 className="w-4 h-4"/></button>
                                            <button onClick={() => handleHapus(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Markas"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[var(--border)]">
                        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Ubah Cabang UDD' : 'Tambah Cabang UDD Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kode UDD / Identitas Sistematik</label>
                                {editingId ? (
                                    <div className="w-full px-4 py-2 bg-gray-100 border border-[var(--border)] rounded-lg text-gray-500 font-mono font-bold cursor-not-allowed">
                                        {regions.find(r => r.id === editingId)?.kodeUdd || 'Generating...'}
                                    </div>
                                ) : (
                                    <div className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 bg-gray-50 text-sm italic">
                                        ID akan di-generate otomatis oleh sistem setelah dibuat (ex: UDD-0001)
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Cabang (ex: UTD PMI Kabupaten Pringsewu)</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-[var(--border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"/>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-[var(--border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none h-24"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                                    <input required type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-[var(--border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                                    <input required type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-[var(--border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"/>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-center gap-2 font-medium">
                                <MapPin className="w-4 h-4 shrink-0" />
                                Koordinat Lat/Lng wajib diisi agar Lokasi Donor memantul di Peta Mobile App.
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
                                <Button type="submit" loading={isSubmitting}>{editingId ? 'Simpan Perubahan' : 'Buat UDD PMI'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Manajemen Pendaftar Markas */}
            {isParticipantsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[var(--border)] flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-emerald-50/30">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                    Antrean Harian Markas (UDD)
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Verifikasi relawan yang walk-in / mendaftar untuk donor hari ini.</p>
                            </div>
                            <button onClick={() => setIsParticipantsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
                            {loadingParticipants ? (
                                <div className="text-center py-10 animate-pulse text-gray-400 font-medium">Memuat antrean...</div>
                            ) : participants.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium text-lg">Antrean Kosong</p>
                                    <p className="text-gray-400 text-sm mt-1">Belum ada relawan yang terdaftar untuk markas ini hari ini.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {participants.map((p) => {
                                        const profile = p.user.donorProfile;
                                        const histories = p.user.donationHistories;
                                        return (
                                            <div key={p.id} className="bg-white border border-[var(--border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700 text-sm">
                                                        {profile?.bloodType || '?'}{profile?.rhesus === 'POSITIVE' ? '+' : '-'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 leading-none mb-1">{profile?.fullName}</h3>
                                                        <p className="text-xs text-gray-500 mb-1 font-mono">{profile?.nik || 'Tanpa NIK'} • {profile?.whatsappNumber}</p>
                                                        {histories && histories.length > 0 ? (
                                                            <p className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded inline-flex">
                                                                Donor Terakhir: {new Date(histories[0].donationDate).toLocaleDateString('id-ID')}
                                                            </p>
                                                        ) : (
                                                            <p className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded inline-flex">
                                                                Pendonor Baru
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        disabled={verifyingId === p.id}
                                                        onClick={() => updateParticipantStatus(p.id, 'ABSENT')} 
                                                        className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4"/> Batal/Ditolak
                                                    </button>
                                                    <button 
                                                        disabled={verifyingId === p.id}
                                                        onClick={() => updateParticipantStatus(p.id, 'ATTENDED')} 
                                                        className="px-4 py-2 bg-[var(--primary)] text-white hover:opacity-90 rounded-lg text-sm font-semibold transition-opacity flex items-center gap-1 disabled:opacity-50 shadow-sm"
                                                    >
                                                        <CheckCircle className="w-4 h-4"/> Validasi Hadir
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
