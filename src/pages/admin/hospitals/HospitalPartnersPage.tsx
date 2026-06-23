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
  Eye,
  FileText,
  Activity
} from 'lucide-react'
import { getHospitalProfiles, toggleHospitalActive } from '@/api/hospital'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Daftar RS Swasta Mitra</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manajemen dan pemantauan akun Rumah Sakit Swasta yang terdaftar di UDD PMI.
        </p>
      </div>

      {/* Main Card */}
      <Card className="overflow-hidden">
        {/* Search bar and info */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Cari RS, PIC, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Menampilkan <span className="font-semibold text-[var(--text)]">{profiles.length}</span> dari{' '}
            <span className="font-semibold text-[var(--text)]">{totalItems}</span> rumah sakit
          </div>
        </div>

        {/* Content Table / Loader */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-muted)]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-t-transparent"></div>
            <p className="text-sm">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="text-lg font-semibold text-[var(--text)]">Terjadi Kesalahan</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md">{error}</p>
            <button
              onClick={fetchProfiles}
              className="mt-4 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm font-medium rounded-xl transition-all"
            >
              Coba Lagi
            </button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--text-muted)]">
            <Building2 className="w-16 h-16 text-[var(--border)] mb-3" />
            <p className="text-base font-semibold text-[var(--text)]">Tidak ada RS Swasta ditemukan</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider w-16">No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nama Rumah Sakit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">PIC / Penanggung Jawab</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Email Akun</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {profiles.map((profile, index) => (
                  <tr key={profile.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)] font-medium">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--text)]">{profile.namaRs}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">Izin: {profile.noIzinRs}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--text)]">{profile.namaPic}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{profile.jabatanPic}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text)]">
                      {profile.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={profile.user.isActive ? 'success' : 'danger'}>
                        {profile.user.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProfile(profile)}
                          title="Lihat detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={profile.user.isActive ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(profile)}
                          disabled={actionLoading === profile.id}
                        >
                          {profile.user.isActive ? 'Suspend' : 'Aktifkan'}
                        </Button>
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
          <div className="px-6 py-4 border-t border-[var(--border)] bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Menampilkan {Math.min((currentPage - 1) * 10 + 1, totalItems)} - {Math.min(currentPage * 10, totalItems)} dari {totalItems} rumah sakit
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-[var(--border)] bg-white text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-[var(--border)] bg-white text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedProfile(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Detail Rumah Sakit Mitra
              </h2>
              <button onClick={() => setSelectedProfile(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {[
                { icon: Building2, label: 'Nama Rumah Sakit', value: selectedProfile.namaRs },
                { icon: FileText, label: 'No. Izin Operasional', value: selectedProfile.noIzinRs },
                { icon: MapPin, label: 'Alamat Lengkap', value: selectedProfile.alamatRs },
                { icon: Phone, label: 'No. Telepon RS', value: selectedProfile.noTelpRs },
                { icon: User, label: 'Nama PIC / Jabatan', value: `${selectedProfile.namaPic} — ${selectedProfile.jabatanPic}` },
                { icon: Calendar, label: 'Tanggal Verifikasi', value: new Date(selectedProfile.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</div>
                    <div className="text-sm font-medium text-gray-700 mt-0.5 leading-relaxed">{value}</div>
                  </div>
                </div>
              ))}

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status Akun</div>
                  <div className="mt-1">
                    <Badge variant={selectedProfile.user.isActive ? 'success' : 'danger'}>
                      {selectedProfile.user.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedProfile.dokumenIzin ? (
                <div className="pt-2">
                  <a
                    href={selectedProfile.dokumenIzin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm shadow-[#462C7D]/10"
                  >
                    <Download className="w-4 h-4" /> Unduh Dokumen Izin RS
                  </a>
                </div>
              ) : (
                <div className="text-center py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-400">
                  Tidak ada lampiran berkas dokumen
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <Button
                  variant={selectedProfile.user.isActive ? 'danger' : 'primary'}
                  className="flex-1 text-sm font-bold py-2.5"
                  disabled={actionLoading === selectedProfile.id}
                  onClick={() => handleToggleStatus(selectedProfile)}
                >
                  {selectedProfile.user.isActive ? 'Suspend Akun' : 'Aktifkan Akun'}
                </Button>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
