import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, Plus, Trash2, Globe, Clock, X, Users, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { eventService } from '@/api/services'

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Participant Modal State
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
    const [participants, setParticipants] = useState<any[]>([])
    const [loadingParticipants, setLoadingParticipants] = useState(false)

    // Form data
    const [title, setTitle] = useState('')
    const [locationName, setLocationName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [uddRegionId, setUddRegionId] = useState<string | null>(null)
    const [regionsList, setRegionsList] = useState<any[]>([])

    const openParticipantsModal = async (eventId: string) => {
        setSelectedEventId(eventId)
        setLoadingParticipants(true)
        try {
            const data = await eventService.getParticipants(eventId)
            setParticipants(data)
        } catch (error) {
            alert('Gagal memuat peserta')
        } finally {
            setLoadingParticipants(false)
        }
    }

    const handleUpdateParticipantStatus = async (participantId: string, status: 'ATTENDED' | 'ABSENT') => {
        if (!confirm(`Konfirmasi status ${status} untuk peserta ini?`)) return
        try {
            await eventService.updateParticipantStatus(participantId, status)
            // Refresh data
            if (selectedEventId) {
                const data = await eventService.getParticipants(selectedEventId)
                setParticipants(data)
            }
        } catch (error) {
            alert('Gagal menyetujui')
        }
    }

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAll()
            setEvents(data)
        } catch (error) {
            console.error('Failed to load events', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
        import('@/api/region').then(m => m.regionService.getAll()).then(setRegionsList).catch(console.error)
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await eventService.create({
                title, locationName, startDate, endDate, 
                latitude, longitude, uddRegionId
            })
            setIsModalOpen(false)
            fetchEvents()
            // Reset
            setTitle(''); setLocationName(''); setStartDate(''); setEndDate(''); setLatitude(''); setLongitude(''); setUddRegionId(null);
        } catch (err: any) {
            alert('Gagal membuat event: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus event ini dari jadwal?')) return
        try {
            await eventService.delete(id)
            fetchEvents()
        } catch (error) {
            alert('Gagal menghapus')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex gap-4 items-center">
                    <div className="bg-[var(--primary)] text-white p-3 rounded-xl shadow-md">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Mobil Unit / Event Keliling</h1>
                        <p className="text-[var(--text-muted)] text-sm">Manajemen penyebaran armada jemput bola PMI</p>
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Buka Pendaftaran Event Baru
                </Button>
            </div>

            {loading ? (
                <div className="text-center p-10 text-gray-400">Memuat Jadwal...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map(ev => (
                        <div key={ev.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="bg-gradient-to-r from-red-50 to-white px-5 py-4 border-b border-[var(--border)] flex justify-between items-start">
                                <h3 className="font-bold text-gray-800 text-lg leading-tight">{ev.title}</h3>
                                <div className="flex flex-col gap-1 items-end">
                                    <div className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md uppercase tracking-wider">{ev.status}</div>
                                    {ev.uddRegion && (
                                        <div className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase tracking-wider">{ev.uddRegion.kodeUdd}</div>
                                    )}
                                </div>
                            </div>
                            <div className="p-5 flex-1 space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-[var(--primary)] w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800">{ev.locationName}</div>
                                        {(ev.latitude && ev.longitude) && (
                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Globe className="w-3 h-3"/> Geolocation Active</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="text-[var(--primary)] w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">
                                            {new Date(ev.startDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                        <div className="text-xs text-[var(--primary)]">Selesai: {new Date(ev.endDate).toLocaleTimeString('id-ID', {timeStyle: 'short'})}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-gray-50 border-t border-[var(--border)] flex justify-between items-center">
                                <button onClick={() => openParticipantsModal(ev.id)} className="text-[var(--primary)] hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
                                    <Users className="w-4 h-4" /> 
                                    Pendaftar {ev.participants && ev.participants.length > 0 ? `(${ev.participants.length})` : ''}
                                </button>
                                <button onClick={() => handleDelete(ev.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                    <Trash2 className="w-4 h-4" /> Batalkan
                                </button>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-full p-12 text-center text-gray-400 border border-dashed rounded-2xl bg-white">
                            Belum ada jadwal event armada Mobile Unit terdaftar.
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2">Pendaftaran Armada Keliling</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Event</label>
                                <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" placeholder="Cth: Donor Darah BEM Universitas Pringsewu" className="w-full px-4 py-2 rounded-xl border border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi (Nama)</label>
                                <input required value={locationName} onChange={e=>setLocationName(e.target.value)} type="text" placeholder="Lap. Pendopo Pringsewu" className="w-full px-4 py-2 rounded-xl border border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cabang UDD Penyelenggara (Opsional)</label>
                                <select 
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white"
                                    value={uddRegionId || ''}
                                    onChange={(e) => setUddRegionId(e.target.value || null)}
                                >
                                    <option value="">— Tanpa Cabang —</option>
                                    {regionsList.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.kodeUdd} — {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mulai Pada</label>
                                    <input required value={startDate} onChange={e=>setStartDate(e.target.value)} type="datetime-local" className="w-full px-4 py-2 rounded-xl border border-gray-200" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Berakhir Pada</label>
                                    <input required value={endDate} onChange={e=>setEndDate(e.target.value)} type="datetime-local" className="w-full px-4 py-2 rounded-xl border border-gray-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude (Opsional)</label>
                                    <input value={latitude} onChange={e=>setLatitude(e.target.value)} type="number" step="any" placeholder="-5.362145" className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude (Opsional)</label>
                                    <input value={longitude} onChange={e=>setLongitude(e.target.value)} type="number" step="any" placeholder="105.021557" className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                <Button type="submit" loading={saving}>Rilis Event Sekarang</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PARTICIPANTS MODAL */}
            {selectedEventId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-in fade-in duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2">Monitoring Antrean & Pendaftaran</h3>
                            <button onClick={() => setSelectedEventId(null)} className="text-gray-400 hover:text-red-500 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-[#f9fafb]">
                            {loadingParticipants ? (
                                <div className="text-center text-gray-400 py-10">Memuat Data...</div>
                            ) : participants.length === 0 ? (
                                <div className="text-center font-semibold text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-200">Belum ada relawan yang mendaftar ke kegiatan ini.</div>
                            ) : (
                                <div className="grid gap-4">
                                    {participants.map((p, idx) => (
                                        <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-base">{p.fullName}</h4>
                                                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                                                        <span>Gol. Darah: <b className="text-red-600">{p.bloodType}{p.rhesus}</b></span>
                                                        <span>•</span>
                                                        <span>HP: {p.whatsappNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                {p.status === 'REGISTERED' ? (
                                                    <>
                                                        <button 
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold transition"
                                                            onClick={() => handleUpdateParticipantStatus(p.id, 'ATTENDED')}
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Kelayakan OK (Hadir)
                                                        </button>
                                                        <button 
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition"
                                                            onClick={() => handleUpdateParticipantStatus(p.id, 'ABSENT')}
                                                        >
                                                            <XCircle className="w-4 h-4" /> Gagal/Tdk Hadir
                                                        </button>
                                                    </>
                                                ) : p.status === 'ATTENDED' ? (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 text-green-700 bg-green-100 rounded-full text-xs font-bold uppercase">
                                                        <CheckCircle className="w-3.5 h-3.5"/> Selesai Donor
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 text-gray-500 bg-gray-200 rounded-full text-xs font-bold uppercase">
                                                        <XCircle className="w-3.5 h-3.5"/> Tidak Hadir
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
