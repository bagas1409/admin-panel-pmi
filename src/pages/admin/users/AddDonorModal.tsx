import { useState } from 'react'
import { X, User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle, Copy, ChevronRight, ChevronLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { userService } from '@/api/user'
import LocationPicker from '@/components/ui/LocationPicker'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

type Step = 1 | 2 | 3

const STEPS = [
    { id: 1, label: 'Akun', desc: 'Email & Password' },
    { id: 2, label: 'Identitas', desc: 'NIK & Medis' },
    { id: 3, label: 'Biodata', desc: 'Alamat & Lainnya' },
]

interface FormData {
    // Step 1
    email: string
    password: string
    whatsappNumber: string
    // Step 2
    fullName: string
    nik: string
    bloodType: string
    gender: string
    birthDate: string
    birthPlace: string
    // Step 3
    job: string
    maritalStatus: string
    address: string
    village: string
    subdistrict: string
    city: string
}

export default function AddDonorModal({ isOpen, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<Step>(1)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successData, setSuccessData] = useState<{ email: string; password: string; fullName: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const [form, setForm] = useState<FormData>({
        email: '', password: '', whatsappNumber: '',
        fullName: '', nik: '', bloodType: '', gender: '', birthDate: '', birthPlace: '',
        job: '', maritalStatus: '', address: '', village: '', subdistrict: '', city: '',
    })

    const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [key]: e.target.value }))
        setError(null)
    }

    const validateStep = (): string | null => {
        if (step === 1) {
            if (!form.email) return 'Email wajib diisi.'
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Format email tidak valid.'
            if (!form.password) return 'Password wajib diisi.'
            if (form.password.length < 8) return 'Password minimal 8 karakter.'
            if (!/[A-Z]/.test(form.password)) return 'Password harus mengandung huruf kapital.'
            if (!/[0-9]/.test(form.password)) return 'Password harus mengandung angka.'
            if (!form.whatsappNumber) return 'No. WhatsApp wajib diisi.'
            if (!/^\d{10,}$/.test(form.whatsappNumber)) return 'Nomor WhatsApp minimal 10 digit dan hanya angka.'
        }
        if (step === 2) {
            if (!form.fullName || form.fullName.length < 3) return 'Nama lengkap minimal 3 karakter.'
            if (!form.nik) return 'NIK wajib diisi.'
            if (!/^\d{16}$/.test(form.nik)) return 'NIK harus tepat 16 digit angka.'
        }
        return null
    }

    const next = () => {
        const err = validateStep()
        if (err) { setError(err); return }
        setError(null)
        setStep(s => (s < 3 ? (s + 1) as Step : s))
    }

    const prev = () => {
        setError(null)
        setStep(s => (s > 1 ? (s - 1) as Step : s))
    }

    const handleSubmit = async () => {
        const err = validateStep()
        if (err) { setError(err); return }

        setLoading(true)
        setError(null)
        try {
            await userService.adminRegister({
                email: form.email,
                password: form.password,
                fullName: form.fullName,
                nik: form.nik,
                whatsappNumber: form.whatsappNumber,
                bloodType: form.bloodType || undefined,
                gender: form.gender || undefined,
                birthDate: form.birthDate || undefined,
                birthPlace: form.birthPlace || undefined,
                job: form.job || undefined,
                maritalStatus: form.maritalStatus || undefined,
                address: form.address || undefined,
                village: form.village || undefined,
                subdistrict: form.subdistrict || undefined,
                city: form.city || undefined,
            })
            // Simpan data untuk ditampilkan
            setSuccessData({ email: form.email, password: form.password, fullName: form.fullName })
            onSuccess()
        } catch (e: any) {
            const msg = e.response?.data?.message || 'Gagal menambahkan pendonor.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleClose = () => {
        setStep(1)
        setForm({ email: '', password: '', whatsappNumber: '', fullName: '', nik: '', bloodType: '', gender: '', birthDate: '', birthPlace: '', job: '', maritalStatus: '', address: '', village: '', subdistrict: '', city: '' })
        setError(null)
        setSuccessData(null)
        onClose()
    }

    if (!isOpen) return null

    const inputClass = "w-full px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
    const labelClass = "block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide"

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--background)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                    <div>
                        <h2 className="text-base font-bold text-[var(--text)]">Tambah Pendonor</h2>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Registrasi pendonor walk-in oleh admin</p>
                    </div>
                    <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--border)] transition-colors">
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Success State */}
                {successData ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text)] mb-1">Pendaftaran Berhasil!</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-6">
                            Akun <strong>{successData.fullName}</strong> telah dibuat. Simpan kredensial berikut dan serahkan ke pendonor.
                        </p>
                        <div className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 space-y-3 text-left">
                            <div>
                                <p className="text-xs text-[var(--text-muted)] mb-1">Email</p>
                                <p className="text-sm font-bold text-[var(--text)]">{successData.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-muted)] mb-1">Password Sementara</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-2 rounded-lg tracking-widest">
                                        {successData.password}
                                    </code>
                                    <button
                                        onClick={() => handleCopy(`Email: ${successData.email}\nPassword: ${successData.password}`)}
                                        className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button className="mt-6 w-full" onClick={handleClose}>Selesai</Button>
                    </div>
                ) : (
                    <>
                        {/* Stepper */}
                        <div className="px-6 py-4 border-b border-[var(--border)]">
                            <div className="flex items-center gap-0">
                                {STEPS.map((s, idx) => (
                                    <div key={s.id} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                                                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                                            </div>
                                            <div className="mt-1 text-center">
                                                <p className={`text-xs font-semibold ${step >= s.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>{s.label}</p>
                                            </div>
                                        </div>
                                        {idx < STEPS.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${step > s.id ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* === STEP 1: Akun === */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input type="email" placeholder="donor@email.com" value={form.email} onChange={set('email')} className={`${inputClass} pl-10`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Password Sementara *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 karakter, huruf kapital & angka" value={form.password} onChange={set('password')} className={`${inputClass} pl-10 pr-10`} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {showPassword ? <EyeOff className="w-4 h-4 text-[var(--text-muted)]" /> : <Eye className="w-4 h-4 text-[var(--text-muted)]" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">Password ini akan ditampilkan setelah berhasil untuk diserahkan ke pendonor.</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>No. WhatsApp *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input type="tel" placeholder="08xxxxxxxxxx" value={form.whatsappNumber} onChange={set('whatsappNumber')} className={`${inputClass} pl-10`} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === STEP 2: Identitas === */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Nama Lengkap (Sesuai KTP) *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input type="text" placeholder="Nama sesuai KTP" value={form.fullName} onChange={set('fullName')} className={`${inputClass} pl-10`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>NIK KTP (16 Digit) *</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <input type="text" maxLength={16} placeholder="16 digit angka NIK" value={form.nik} onChange={set('nik')} className={`${inputClass} pl-10`} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <label className={labelClass}>Golongan Darah</label>
                                            <select value={form.bloodType} onChange={set('bloodType')} className={inputClass}>
                                                <option value="">Pilih...</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="AB">AB</option>
                                                <option value="O">O</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Jenis Kelamin</label>
                                            <select value={form.gender} onChange={set('gender')} className={inputClass}>
                                                <option value="">Pilih...</option>
                                                <option value="MALE">Laki-laki</option>
                                                <option value="FEMALE">Perempuan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Tanggal Lahir</label>
                                            <input type="date" value={form.birthDate} onChange={set('birthDate')} className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Tempat Lahir</label>
                                        <input type="text" placeholder="Kota kelahiran" value={form.birthPlace} onChange={set('birthPlace')} className={inputClass} />
                                    </div>
                                </div>
                            )}

                            {/* === STEP 3: Biodata & Alamat === */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Pekerjaan</label>
                                            <select value={form.job} onChange={set('job')} className={inputClass}>
                                                <option value="">Pilih Pekerjaan...</option>
                                                <option value="Pegawai Negeri Sipil (PNS)">Pegawai Negeri Sipil (PNS)</option>
                                                <option value="Pegawai Swasta">Pegawai Swasta</option>
                                                <option value="Wiraswasta / Pengusaha">Wiraswasta / Pengusaha</option>
                                                <option value="TNI / POLRI">TNI / POLRI</option>
                                                <option value="Mahasiswa / Pelajar">Mahasiswa / Pelajar</option>
                                                <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                                                <option value="Dokter / Tenaga Medis">Dokter / Tenaga Medis</option>
                                                <option value="Pekerja Lepas (Freelance)">Pekerja Lepas (Freelance)</option>
                                                <option value="Tidak Bekerja">Tidak Bekerja</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Status Pernikahan</label>
                                            <select value={form.maritalStatus} onChange={set('maritalStatus')} className={inputClass}>
                                                <option value="">Pilih...</option>
                                                <option value="Lajang">Lajang</option>
                                                <option value="Menikah">Menikah</option>
                                                <option value="Cerai">Cerai</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Alamat Lengkap</label>
                                        <textarea rows={2} placeholder="Jl. ..." value={form.address} onChange={set('address')} className={`${inputClass} resize-none mb-4`} />
                                    </div>
                                    
                                    <div className="pt-2 border-t border-[var(--border)]">
                                        <h4 className="text-sm font-bold text-[var(--primary)] mb-4">Pilih Wilayah Domisili</h4>
                                        <LocationPicker 
                                            onChange={(locations: { city: string, subdistrict: string, village: string }) => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    city: locations.city,
                                                    subdistrict: locations.subdistrict,
                                                    village: locations.village
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                            <Button variant="ghost" onClick={step === 1 ? handleClose : prev} className="gap-1">
                                {step === 1 ? 'Batal' : <><ChevronLeft className="w-4 h-4" /> Kembali</>}
                            </Button>
                            <div className="flex items-center gap-1">
                                {STEPS.map(s => (
                                    <div key={s.id} className={`w-2 h-2 rounded-full transition-colors ${step === s.id ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
                                ))}
                            </div>
                            {step < 3 ? (
                                <Button onClick={next} className="gap-1">
                                    Lanjut <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} loading={loading}>
                                    Daftarkan Pendonor
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
