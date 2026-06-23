import { useState, useEffect } from 'react'
import { X, Calendar, MapPin, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { userService } from '@/api/user'
import { regionService } from '@/api/region'
import { eventService } from '@/api/services'
import type { User, Region } from '@/types'

interface Props {
    isOpen: boolean
    user: User | null
    onClose: () => void
    onSuccess: () => void
}

export default function DonorinModal({ isOpen, user, onClose, onSuccess }: Props) {
    const [targetType, setTargetType] = useState<'REGION' | 'EVENT'>('REGION')
    const [targetId, setTargetId] = useState('')
    const [regions, setRegions] = useState<Region[]>([])
    const [events, setEvents] = useState<any[]>([])
    
    const [loadingData, setLoadingData] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const fetchData = async () => {
            setLoadingData(true)
            setError(null)
            try {
                // Load regions
                const rData = await regionService.getAll()
                setRegions(rData)

                // Load events
                const eData = await eventService.getAll()
                // Filter only upcoming/ongoing
                const activeEvents = eData.filter((e: any) => e.status === 'UPCOMING' || e.status === 'ONGOING')
                setEvents(activeEvents)
            } catch (err) {
                console.error(err)
            } finally {
                setLoadingData(false)
            }
        }
        
        fetchData()
        
        // Reset form
        setTargetType('REGION')
        setTargetId('')
        setError(null)
    }, [isOpen])

    const handleSubmit = async () => {
        if (!targetId || !user) {
            setError("Silakan pilih target lokasi/kegiatan terlebih dahulu.")
            return
        }
        
        setLoadingSubmit(true)
        setError(null)

        try {
            await userService.adminDonorin(user.id, {
                targetType,
                targetId
            })
            
            alert('Relawan berhasil didaftarkan ke target yang dipilih!')
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Gagal mendaftarkan relawan.')
        } finally {
            setLoadingSubmit(false)
        }
    }

    if (!isOpen || !user) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-[var(--background)] rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-600" />
                        <div>
                            <h2 className="text-base font-bold text-[var(--text)]">Daftarkan Donor (Donorin)</h2>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Penjadwalan manual relawan</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--border)] transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Info Relawan */}
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs text-red-600 uppercase tracking-wider font-bold mb-1">Target Relawan</p>
                        <p className="font-bold text-gray-900 text-lg">{user.donorProfile?.fullName || 'Tanpa Nama'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm font-semibold text-red-700 mt-2">
                            Gol Darah: {user.donorProfile?.bloodType || '?'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                            {error}
                        </div>
                    )}

                    {loadingData ? (
                        <div className="text-center py-6 text-gray-400">Memuat target...</div>
                    ) : (
                        <div className="space-y-4">
                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                <button
                                    onClick={() => { setTargetType('REGION'); setTargetId(''); setError(null) }}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                        targetType === 'REGION' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <MapPin className="w-4 h-4" /> UDD (Markas)
                                </button>
                                <button
                                    onClick={() => { setTargetType('EVENT'); setTargetId(''); setError(null) }}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                        targetType === 'EVENT' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Calendar className="w-4 h-4" /> Event Keliling
                                </button>
                            </div>

                            {/* Dropdown Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    {targetType === 'REGION' ? 'Pilih Markas UDD' : 'Pilih Kegiatan (UPCOMING/ONGOING)'}
                                </label>
                                
                                {targetType === 'REGION' && regions.length === 0 && (
                                    <p className="text-xs text-red-500 italic mt-1">Tidak ada markas UDD terdaftar.</p>
                                )}
                                
                                {targetType === 'EVENT' && events.length === 0 && (
                                    <p className="text-xs text-red-500 italic mt-1">Tidak ada Event Keliling yang aktif.</p>
                                )}

                                <select
                                    value={targetId}
                                    onChange={(e) => setTargetId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                >
                                    <option value="">-- Pilih Target --</option>
                                    {targetType === 'REGION' && regions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} - {r.kodeUdd}</option>
                                    ))}
                                    {targetType === 'EVENT' && events.map(e => (
                                        <option key={e.id} value={e.id}>{e.title} ({e.locationName})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[var(--border)] flex justify-end gap-3 bg-gray-50">
                    <Button variant="ghost" onClick={onClose} disabled={loadingSubmit}>Batal</Button>
                    <Button onClick={handleSubmit} loading={loadingSubmit} disabled={!targetId || loadingData}>
                        Submit Pendaftaran
                    </Button>
                </div>
            </div>
        </div>
    )
}
