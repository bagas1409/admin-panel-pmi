import { useState, useEffect } from 'react'
import { X, Save, User as UserIcon, Phone, Droplets, MapPin, Briefcase, Heart } from 'lucide-react'
import { userService } from '@/api/user'
import type { User } from '@/types'
import LocationPicker from '@/components/ui/LocationPicker'

interface EditUserModalProps {
  user: User | null
  onClose: () => void
  onSuccess: () => void
}

const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const
const BT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  B:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  O:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  AB: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
}
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Laki-laki' },
  { value: 'FEMALE', label: 'Perempuan' },
]
const MARITAL_OPTIONS = [
  { value: 'SINGLE', label: 'Belum Menikah' },
  { value: 'MARRIED', label: 'Menikah' },
  { value: 'DIVORCED', label: 'Cerai Hidup' },
  { value: 'WIDOWED', label: 'Cerai Mati' },
]

function SectionTitle({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
      <Icon className="w-4 h-4 text-[var(--primary)]" />
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const p = user?.donorProfile

  const [form, setForm] = useState({
    email: user?.email ?? '',
    fullName: p?.fullName ?? '',
    nik: p?.nik ?? '',
    whatsappNumber: p?.whatsappNumber ?? '',
    bloodType: p?.bloodType ?? '',
    gender: p?.gender ?? '',
    birthDate: p?.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : '',
    birthPlace: p?.birthPlace ?? '',
    job: p?.job ?? '',
    maritalStatus: p?.maritalStatus ?? '',
    address: p?.address ?? '',
    village: p?.village ?? '',
    subdistrict: p?.subdistrict ?? '',
    city: p?.city ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-sync jika user prop berubah
  useEffect(() => {
    if (!user) return
    const pr = user.donorProfile
    setForm({
      email: user.email ?? '',
      fullName: pr?.fullName ?? '',
      nik: pr?.nik ?? '',
      whatsappNumber: pr?.whatsappNumber ?? '',
      bloodType: pr?.bloodType ?? '',
      gender: pr?.gender ?? '',
      birthDate: pr?.birthDate ? new Date(pr.birthDate).toISOString().split('T')[0] : '',
      birthPlace: pr?.birthPlace ?? '',
      job: pr?.job ?? '',
      maritalStatus: pr?.maritalStatus ?? '',
      address: pr?.address ?? '',
      village: pr?.village ?? '',
      subdistrict: pr?.subdistrict ?? '',
      city: pr?.city ?? '',
    })
    setError(null)
  }, [user])

  if (!user) return null

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  })

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-gray-800 placeholder-gray-400 transition-shadow'

  const handleSave = async () => {
    if (!form.fullName.trim()) return setError('Nama lengkap wajib diisi.')
    setSaving(true)
    setError(null)
    try {
      await userService.update(user.id, {
        ...form,
        bloodType: form.bloodType || undefined,
        gender: form.gender || undefined,
        birthDate: form.birthDate || undefined,
        maritalStatus: form.maritalStatus || undefined,
      })
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Gagal menyimpan perubahan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Edit Biodata Pendonor</h2>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — Scrollable */}
        <div className="overflow-y-auto p-6 space-y-6">

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Informasi Akun */}
          <div>
            <SectionTitle icon={UserIcon} label="Informasi Akun & Identitas" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Akun</label>
                <input type="email" placeholder="email@contoh.com" className={inputCls} {...field('email')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nama lengkap" className={inputCls} {...field('fullName')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">NIK</label>
                <input type="text" placeholder="16 digit NIK" maxLength={16} className={inputCls} {...field('nik')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">No. WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" placeholder="08xxx" className={`${inputCls} pl-9`} {...field('whatsappNumber')} />
                </div>
              </div>
            </div>
          </div>

          {/* Golongan Darah */}
          <div>
            <SectionTitle icon={Droplets} label="Data Medis" />
            <label className="block text-xs font-semibold text-gray-600 mb-2">Golongan Darah</label>
            <div className="flex gap-2">
              {BLOOD_TYPES.map(bt => {
                const c = BT_COLORS[bt]
                const selected = form.bloodType === bt
                return (
                  <button key={bt} type="button"
                    onClick={() => setForm(f => ({ ...f, bloodType: f.bloodType === bt ? '' : bt }))}
                    className="flex-1 py-2.5 rounded-xl border-2 font-black text-sm transition-all"
                    style={selected
                      ? { backgroundColor: c.bg, borderColor: c.text, color: c.text }
                      : { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#9CA3AF' }
                    }
                  >{bt}</button>
                )
              })}
            </div>
          </div>

          {/* Data Pribadi */}
          <div>
            <SectionTitle icon={Heart} label="Data Pribadi" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis Kelamin</label>
                <select className={inputCls} {...field('gender')}>
                  <option value="">-- Pilih --</option>
                  {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status Pernikahan</label>
                <select className={inputCls} {...field('maritalStatus')}>
                  <option value="">-- Pilih --</option>
                  {MARITAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tempat Lahir</label>
                <input type="text" placeholder="Kota lahir" className={inputCls} {...field('birthPlace')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal Lahir</label>
                <input type="date" className={inputCls} {...field('birthDate')} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pekerjaan</label>
                <select className={inputCls} {...field('job')}>
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
            </div>
          </div>

          {/* Alamat */}
          <div>
            <SectionTitle icon={MapPin} label="Alamat Domisili" />
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alamat Lengkap</label>
                <textarea rows={2} placeholder="Jl. Contoh No. 1..." className={`${inputCls} resize-none`} {...field('address')} />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="mb-4 flex flex-col p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                   <p className="text-xs text-blue-800 mb-1">Domisili Tersimpan Saat Ini:</p>
                   <p className="text-sm font-bold text-blue-900">
                     {user.donorProfile?.village || '-'}, {user.donorProfile?.subdistrict || '-'}, {user.donorProfile?.city || '-'}
                   </p>
                </div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Pilih Wilayah Domisili Baru (Otomatis mengganti yang lama)</h4>
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
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}
