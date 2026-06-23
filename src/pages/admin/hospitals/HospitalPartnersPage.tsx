import { useState, useEffect } from 'react'
import {
  Search,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react'
import { getHospitalProfiles, toggleHospitalActive } from '@/api/hospital'
import type { User as UserType } from '@/types'

interface HospitalProfile {
  id: string
  namaRs: string
  noIzinRs: string
  alamatRs: string
  noTelpRs: string
  namaPic: string
  jabatanPic: string
  dokumenIzin?: string
  createdAt: string
  user: {
    id: string
    email: string
    isActive: boolean
  }
}

export default function HospitalPartnersPage() {
  const [profiles, setProfiles] = useState<HospitalProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  // Modal States
  const [selectedProfile, setSelectedProfile] = useState<HospitalProfile | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1) // Reset page on search
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHospitalProfiles(currentPage, 10, debouncedSearch)
      setProfiles(data.profiles)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.total)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Gagal memuat daftar rumah sakit mitra.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [currentPage, debouncedSearch])

  const handleToggleStatus = async (profile: HospitalProfile) => {
    const confirmMessage = profile.user.isActive
      ? `Apakah Anda yakin ingin menangguhkan (suspend) akses untuk ${profile.namaRs}?`
      : `Apakah Anda yakin ingin mengaktifkan kembali akses untuk ${profile.namaRs}?`
      
    if (!window.confirm(confirmMessage)) return

    setActionLoading(profile.id)
    try {
      const result = await toggleHospitalActive(profile.id)
      
      // Update local state reactively
      setProfiles(prev =>
        prev.map(p =>
          p.id === profile.id
            ? { ...p, user: { ...p.user, isActive: result.isActive } }
            : p
        )
      )

      if (selectedProfile && selectedProfile.id === profile.id) {
        setSelectedProfile(prev => prev ? { ...prev, user: { ...prev.user, isActive: result.isActive } } : null)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status keaktifan.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Daftar RS Swasta Mitra</h1>
          <p className="text-sm text-purple-200/60 mt-1">
            Manajemen dan pemantauan akun Rumah Sakit Swasta yang terdaftar di UDD PMI.
          </p>
        </div>
      </div>

      {/* Main Card with Glassmorphism */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        {/* Search bar and info */}
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200/40" />
            <input
              type="text"
              placeholder="Cari RS, PIC, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-purple-200/30 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
            />
          </div>
          <div className="text-xs text-purple-200/50">
            Menampilkan <span className="font-semibold text-white">{profiles.length}</span> dari{' '}
            <span className="font-semibold text-white">{totalItems}</span> rumah sakit
          </div>
        </div>

        {/* Content Table / Loader */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-purple-200/50">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-t-transparent"></div>
            <p className="text-sm">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="text-lg font-semibold text-white">Terjadi Kesalahan</h3>
            <p className="text-sm text-purple-200/60 mt-1 max-w-md">{error}</p>
            <button
              onClick={fetchProfiles}
              className="mt-4 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm font-medium rounded-xl transition-all"
            >
              Coba Lagi
            </button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-purple-200/50">
            <Building2 className="w-16 h-16 text-purple-200/20 mb-3" />
            <p className="text-base font-semibold text-white">Tidak ada RS Swasta ditemukan</p>
            <p className="text-xs text-purple-200/40 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-purple-200/50 bg-white/5">
                  <th className="py-4 px-5">No</th>
                  <th className="py-4 px-5">Nama Rumah Sakit</th>
                  <th className="py-4 px-5">PIC / Penanggung Jawab</th>
                  <th className="py-4 px-5">Email Akun</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-purple-100">
                {profiles.map((profile, index) => (
                  <tr key={profile.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-5 text-purple-200/40 font-medium">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white">{profile.namaRs}</div>
                      <div className="text-xs text-purple-200/50 mt-0.5">Izin: {profile.noIzinRs}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-medium text-white">{profile.namaPic}</div>
                      <div className="text-xs text-purple-200/50 mt-0.5">{profile.jabatanPic}</div>
                    </td>
                    <td className="py-4 px-5 text-purple-200/80">
                      {profile.user.email}
                    </td>
                    <td className="py-4 px-5">
                      {profile.user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Ditangguhkan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className="p-2 bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white rounded-lg transition-all"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(profile)}
                          disabled={actionLoading === profile.id}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                            profile.user.isActive
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                          }`}
                        >
                          {actionLoading === profile.id ? 'Loading...' : profile.user.isActive ? 'Suspend' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {!loading && totalPages > 1 && (
          <div className="p-5 border-t border-white/5 flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelum
            </button>
            <div className="text-xs text-purple-200/50">
              Halaman <span className="font-semibold text-white">{currentPage}</span> dari{' '}
              <span className="font-semibold text-white">{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-white/5 transition-all"
            >
              Berikut <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2F1D53] to-[#190F30] rounded-2xl border border-white/10 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Title */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedProfile.namaRs}</h3>
                  <p className="text-xs text-purple-200/40 mt-0.5">ID Profil: {selectedProfile.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-purple-200/50 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4">
              {/* Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                selectedProfile.user.isActive
                  ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                  : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
              }`}>
                <span>Status Akun di Platform:</span>
                <span className="uppercase tracking-wider">{selectedProfile.user.isActive ? 'Aktif' : 'Ditangguhkan'}</span>
              </div>

              {/* Data RS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200/40">Data Instansi</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                    <span className="block text-[11px] text-purple-200/50">Nomor Izin RS</span>
                    <span className="text-sm font-medium text-white block mt-0.5">{selectedProfile.noIzinRs}</span>
                  </div>

                  <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                    <span className="block text-[11px] text-purple-200/50">Telepon Instansi</span>
                    <span className="text-sm font-medium text-white block mt-0.5">{selectedProfile.noTelpRs}</span>
                  </div>

                  <div className="bg-white/2 p-3 rounded-xl border border-white/5 sm:col-span-2 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-purple-200/40 mt-1 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-purple-200/50">Alamat Lengkap</span>
                      <span className="text-xs text-purple-100 mt-0.5 block leading-relaxed">{selectedProfile.alamatRs}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data PIC */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200/40">Penanggung Jawab (PIC)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-white/2 p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
                    <User className="w-4 h-4 text-purple-200/40 shrink-0" />
                    <div>
                      <span className="block text-[11px] text-purple-200/50">Nama PIC</span>
                      <span className="text-sm font-medium text-white block mt-0.5">{selectedProfile.namaPic}</span>
                    </div>
                  </div>

                  <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                    <span className="block text-[11px] text-purple-200/50">Jabatan PIC</span>
                    <span className="text-sm font-medium text-white block mt-0.5">{selectedProfile.jabatanPic}</span>
                  </div>
                </div>
              </div>

              {/* Data System */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200/40">Sistem & Berkas</h4>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/2 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-purple-200/50 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-200/40" /> Tanggal Verifikasi
                    </span>
                    <span className="text-white font-medium">
                      {new Date(selectedProfile.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {selectedProfile.dokumenIzin ? (
                    <a
                      href={selectedProfile.dokumenIzin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/30 hover:border-[var(--primary)]/50 rounded-xl text-sm font-semibold text-white transition-all shadow-md"
                    >
                      <Download className="w-4 h-4 text-purple-300" /> Unduh Dokumen Izin RS
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-3 bg-white/2 border border-white/10 rounded-xl text-xs text-purple-200/40">
                      Tidak ada lampiran berkas dokumen
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => handleToggleStatus(selectedProfile)}
                disabled={actionLoading === selectedProfile.id}
                className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedProfile.user.isActive
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {actionLoading === selectedProfile.id ? 'Loading...' : selectedProfile.user.isActive ? 'Tangguhkan Akun' : 'Aktifkan Akun'}
              </button>
              <button
                onClick={() => setSelectedProfile(null)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
