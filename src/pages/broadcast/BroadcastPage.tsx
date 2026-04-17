import { useEffect, useState } from 'react'
import { RadioTower, Send, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { broadcastService } from '@/api/services'

export default function BroadcastPage() {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [type, setType] = useState('EMERGENCY')
    const [sending, setSending] = useState(false)

    const fetchHistory = async () => {
        try {
            const data = await broadcastService.getAll()
            setHistory(data)
        } catch (err) {
            console.error('Failed to load broadcast history', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm('PERHATIAN: Pesan ini akan disebarkan ke SELURUH Aplikasi Ponsel Pendonor. Lanjutkan?')) return
        setSending(true)
        try {
            await broadcastService.sendEmergency({ title, message, type })
            setTitle('')
            setMessage('')
            setType('EMERGENCY')
            fetchHistory()
        } catch (err: any) {
            alert('Gagal menyebarkan sinyal: ' + err.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-[var(--primary)] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-white/10">
                        <RadioTower className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-extrabold flex items-center gap-2 mb-2">
                            <RadioTower className="w-6 h-6" /> Terminal Siar
                        </h2>
                        <p className="text-white/80 text-sm mb-6">Pusat transmisi sinyal PUSH Notification langsung ke aplikasi seluler pergelangan tangan pendonor aktif PMI Pringsewu.</p>
                        
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-white/90">Jenis Siaran</label>
                                <select 
                                    value={type} onChange={e=>setType(e.target.value)}
                                    className="w-full mt-1.5 focus:outline-none p-2 rounded-xl text-gray-800 bg-white"
                                >
                                    <option value="EMERGENCY">🚨 CITO / DARURAT DARAH!</option>
                                    <option value="INFO">ℹ️ Informasi Standar</option>
                                    <option value="REMINDER">⏰ Reminder Umum</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-white/90">Judul Push</label>
                                <input 
                                    required value={title} onChange={e=>setTitle(e.target.value)}
                                    type="text" placeholder="Dibutuhkan Darah AB+!" 
                                    className="w-full mt-1.5 p-2.5 rounded-xl text-gray-800 bg-white/95 focus:bg-white focus:outline-none" 
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-white/90">Isi Body Notifikasi</label>
                                <textarea 
                                    required value={message} onChange={e=>setMessage(e.target.value)}
                                    rows={4} placeholder="Pesan singkat untuk pendonor..." 
                                    className="w-full mt-1.5 p-3 rounded-xl text-gray-800 bg-white/95 focus:bg-white resize-none focus:outline-none"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                loading={sending}
                                className={`w-full mt-4 flex items-center justify-center gap-2 border-0 ${type === 'EMERGENCY' ? 'bg-black hover:bg-gray-900 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                            >
                                <Send className="w-4 h-4" /> TRANSMIT SEKARANG
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm h-full flex flex-col">
                    <div className="p-6 border-b border-[var(--border)]">
                        <h3 className="text-lg font-bold text-gray-800">Riwayat Transmisi Sistem</h3>
                        <p className="text-sm text-gray-500 mt-1">Log rekam jejak siaran notifikasi yang telah dipancarkan sebelumnya.</p>
                    </div>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">Memuat log...</div>
                    ) : (
                        <div className="p-6 flex-1 bg-gray-50/50 overflow-y-auto space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center text-gray-400 py-10">Belum ada riwayat siaran.</div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className="bg-white border text-left border-gray-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`mt-1 flex-shrink-0 ${item.type === 'EMERGENCY' ? 'text-red-600' : item.type === 'INFO' ? 'text-blue-500' : 'text-orange-500'}`}>
                                            {item.type === 'EMERGENCY' ? <AlertTriangle className="w-6 h-6"/> : item.type === 'INFO' ? <Info className="w-6 h-6"/> : <CheckCircle className="w-6 h-6"/>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short'})}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{item.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
