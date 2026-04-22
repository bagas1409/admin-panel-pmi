import { useEffect, useState } from "react";
import {
  History,
  X,
  Phone,
  Droplets,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Users,
  Activity,
} from "lucide-react";
import { donorService } from "@/api/donor";
import type { User } from "@/types";
import DonorinModal from "../users/DonorinModal";

// ── Utility: Hitung hari sejak tanggal tertentu ─────────────────────────────
const getDaysSince = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
};

const getDonorStatus = (histories?: { donationDate: string }[]) => {
  if (!histories || histories.length === 0)
    return {
      label: "Belum Pernah Donor",
      color: "#9CA3AF",
      bg: "#F3F4F6",
      icon: "none",
      days: null,
    };
  const sorted = [...histories].sort(
    (a, b) =>
      new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime(),
  );
  const days = getDaysSince(sorted[0].donationDate);
  if (days === null)
    return {
      label: "Data Tidak Valid",
      color: "#9CA3AF",
      bg: "#F3F4F6",
      icon: "none",
      days: null,
    };
  if (days <= 30)
    return {
      label: `Masa Pemulihan (hari ke-${days})`,
      color: "#059669",
      bg: "#D1FAE5",
      icon: "recovery",
      days,
    };
  if (days < 90)
    return {
      label: `Hampir Siap (${days} hari)`,
      color: "#D97706",
      bg: "#FEF3C7",
      icon: "soon",
      days,
    };
  return {
    label: `Siap Donor Ulang (${days} hari)`,
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: "ready",
    days,
  };
};

// ── Dummy Data: 10 Relawan Palsu ──────────────────────────────────────────────
const dummyDonors: User[] = Array.from({ length: 10 }).map((_, i) => {
  // Bangkitkan rentang waktu secara acak untuk memunculkan 3 kombinasi status
  let daysAgo = 0;
  if (i % 3 === 0)
    daysAgo = Math.floor(Math.random() * 20) + 1; // 1-20 hari -> Masa Pemulihan
  else if (i % 3 === 1)
    daysAgo = Math.floor(Math.random() * 50) + 31; // 31-80 hari -> Hampir Siap
  else daysAgo = Math.floor(Math.random() * 100) + 91; // 91+ hari -> Siap Donor Ulang

  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  const bloodTypes: ("A" | "B" | "AB" | "O")[] = ["A", "B", "AB", "O"];
  const names = [
    "Rindi Oktaviani",
    "Reda Sari",
    "Habib Rehan",
    "Adeng Robikurnia",
    "Irsad Khadafi",
    "Nita Ayu Tiara",
    "Bintang Pathra wijaya",
    "Farah Kuatulatifa",
    "Rangga Saputra",
    "Chalisa Rahmadan",
  ];

  return {
    id: `dummy-${i}`,
    email: `relawan.demo${i}@example.com`,
    role: "USER",
    isActive: true,
    donorProfile: {
      fullName: names[i],
      nik: `317${Math.floor(1000000000000 + Math.random() * 900000000000)}`,
      whatsappNumber: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      bloodType: bloodTypes[i % 4],
      totalDonations: Math.floor(Math.random() * 15) + 1,
      lastDonationDate: date.toISOString(),
    },
    donationHistories: [
      {
        id: `hist-dummy-${i}`,
        locationName: "UTD PMI Setempat (Simulasi)",
        donationDate: date.toISOString(),
      },
    ],
  };
});

export default function DonorsPage() {
  const [donors, setDonors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // state Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal Riwayat
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modal Donorin
  const [donorinUser, setDonorinUser] = useState<User | null>(null);

  const fetchDonors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await donorService.getAllDonors();
      setDonors(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat data pendonor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // ── Data Merging ────────────────────────────────────────────────────────
  // Menggabungkan 10 dummy (akan di posisi awal) dengan data riil
  const combinedDonors = [...dummyDonors, ...donors];

  const filtered = combinedDonors.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.donorProfile?.fullName?.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.donorProfile?.nik?.includes(q) ||
      d.donorProfile?.bloodType?.toLowerCase().includes(q)
    );
  });

  // ── Pagination Logic ────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedDonors = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset halaman ke-1 jika melakukan pencarian agar tidak bug blank screen
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ── Ringkasan Statistik (Seluruh Data + Dummy) ──────────────────────────
  const totalDonors = combinedDonors.length;
  const readyDonors = combinedDonors.filter((d) => {
    const s = getDonorStatus(d.donationHistories);
    return s.icon === "ready";
  }).length;
  const newDonors = combinedDonors.filter(
    (d) => !d.donationHistories?.length,
  ).length;

  return (
    <div className="space-y-6 relative">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            Monitoring Relawan Pendonor
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Kelola & pantau kesehatan dan kesiapan seluruh relawan donor PMI
          </p>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">
              {totalDonors}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Total Relawan Terdaftar
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">
              {readyDonors}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Siap Donor Ulang
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">
              {newDonors}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Belum Pernah Donor
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIK, email, atau golongan darah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── TABEL UTAMA ── */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--border)] text-gray-500 uppercase text-xs tracking-wider">
                <th className="px-6 py-4 font-bold">Relawan</th>
                <th className="px-6 py-4 font-bold">Gol. Darah</th>
                <th className="px-6 py-4 font-bold text-center">Total Donor</th>
                <th className="px-6 py-4 font-bold">Status Kesiapan</th>
                <th className="px-6 py-4 font-bold text-center">Kontak</th>
                <th className="px-6 py-4 font-bold text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
                      <span className="text-sm">
                        Memuat data seluruh relawan...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedDonors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 text-sm"
                  >
                    {search
                      ? `Tidak ada relawan yang sesuai dengan pencarian "${search}"`
                      : "Belum ada relawan terdaftar."}
                  </td>
                </tr>
              ) : (
                paginatedDonors.map((d) => {
                  const status = getDonorStatus(d.donationHistories);
                  const waNumber = d.donorProfile?.whatsappNumber
                    ?.replace(/^0/, "62")
                    .replace(/\D/g, "");
                  const waLink = waNumber ? `https://wa.me/${waNumber}` : null;
                  const latestDonation = d.donationHistories?.[0];

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Kolom Relawan */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[var(--primary)] font-bold text-sm">
                              {d.donorProfile?.fullName?.charAt(0) ||
                                d.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)] text-sm">
                              {d.donorProfile?.fullName || (
                                <span className="text-gray-400 italic">
                                  Profil Belum Lengkap
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {d.email}
                            </div>
                            {d.donorProfile?.nik && (
                              <div className="text-xs text-gray-400 font-mono">
                                NIK: {d.donorProfile.nik}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kolom Gol. Darah */}
                      <td className="px-6 py-4">
                        {d.donorProfile?.bloodType ? (
                          <span className="inline-flex items-center bg-red-50 text-[var(--primary)] px-3 py-1.5 rounded-xl text-sm font-bold border border-red-100">
                            <Droplets className="w-3.5 h-3.5 mr-1.5" />
                            {d.donorProfile.bloodType}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">-</span>
                        )}
                      </td>

                      {/* Kolom Total Donor */}
                      <td className="px-6 py-4 text-center">
                        <div className="text-2xl font-bold text-[var(--text)]">
                          {d.donorProfile?.totalDonations ?? 0}
                        </div>
                        <div className="text-xs text-gray-400">kali</div>
                      </td>

                      {/* Kolom Status Kesiapan */}
                      <td className="px-6 py-4">
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.icon === "ready" && (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          {status.icon === "soon" && (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {status.icon === "recovery" && (
                            <AlertCircle className="w-3.5 h-3.5" />
                          )}
                          {status.label}
                        </div>
                        {latestDonation && (
                          <div className="text-xs text-gray-400 mt-1 ml-1">
                            Terakhir:{" "}
                            {new Date(
                              latestDonation.donationDate,
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </td>

                      {/* Kolom Kontak / WA */}
                      <td className="px-6 py-4 text-center">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Hubungi ${d.donorProfile?.fullName} via WhatsApp`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold border border-green-200 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>

                      {/* Kolom Detail / Riwayat */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedUser(d)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                          title="Lihat jejak donasi lengkap"
                        >
                          <History className="w-3.5 h-3.5" />
                          Jejak Donor
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER PAGINASI ── */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-gray-50/30 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-700">
              {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}
            </span>{" "}
            hingga{" "}
            <span className="font-semibold text-gray-700">
              {Math.min(currentPage * itemsPerPage, filtered.length)}
            </span>{" "}
            dari total{" "}
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            relawan
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[var(--border)] bg-white text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Antara Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-[var(--border)] bg-white text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL JEJAK RIWAYAT ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[var(--border)] flex flex-col max-h-[85vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
                  <span className="text-[var(--primary)] font-bold text-sm">
                    {selectedUser.donorProfile?.fullName?.charAt(0) ||
                      selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    {selectedUser.donorProfile?.fullName || selectedUser.email}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedUser.donorProfile?.nik
                      ? `NIK: ${selectedUser.donorProfile.nik}`
                      : selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RINGKASAN PROFIL */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-[var(--border)] grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-[var(--text)]">
                  {selectedUser.donorProfile?.bloodType ?? "?"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Gol. Darah</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--text)]">
                  {selectedUser.donorProfile?.totalDonations ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Total Donor</div>
              </div>
              <div>
                <div
                  className="text-sm font-bold px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: getDonorStatus(
                      selectedUser.donationHistories,
                    ).bg,
                    color: getDonorStatus(selectedUser.donationHistories).color,
                  }}
                >
                  {getDonorStatus(selectedUser.donationHistories).icon ===
                  "ready"
                    ? "Siap Donor"
                    : getDonorStatus(selectedUser.donationHistories).icon ===
                        "recovery"
                      ? "Pemulihan"
                      : getDonorStatus(selectedUser.donationHistories).icon ===
                          "soon"
                        ? "Hampir Siap"
                        : "Belum Pernah"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Status</div>
              </div>
            </div>

            {/* ACTION: Donorin */}
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <button
                onClick={() => setDonorinUser(selectedUser)}
                disabled={getDonorStatus(selectedUser.donationHistories).icon !== "ready"}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Activity className="w-5 h-5" />
                Daftarkan ke Markas / Event (Donorin)
              </button>
              {getDonorStatus(selectedUser.donationHistories).icon !== "ready" && (
                <p className="text-xs text-center text-amber-600 mt-2 font-medium">
                  Relawan ini belum memenuhi syarat pemulihan (60 hari).
                </p>
              )}
            </div>

            {/* TIMELINE */}
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--primary)]" />
                Jejak Perjalanan Donasi
              </h3>
              {!selectedUser.donationHistories?.length ? (
                <div className="text-center py-10">
                  <Droplets className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    Belum ada riwayat donasi tercatat.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedUser.donationHistories.map((log, i) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-[var(--primary)] rounded-full mt-1.5 flex-shrink-0 shadow shadow-red-200" />
                        {i !== selectedUser.donationHistories!.length - 1 && (
                          <div className="w-0.5 flex-1 bg-red-100 my-1" />
                        )}
                      </div>
                      <div className="bg-white border border-[var(--border)] rounded-xl p-3.5 flex-1 mb-0.5 shadow-sm">
                        <p className="font-semibold text-gray-800 text-sm">
                          {log.locationName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.donationDate).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer WA */}
            {selectedUser.donorProfile?.whatsappNumber && (
              <div className="px-6 py-4 border-t border-[var(--border)]">
                <a
                  href={`https://wa.me/${selectedUser.donorProfile.whatsappNumber.replace(/^0/, "62").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi via WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Daftarkan (Donorin) relawan ke Event/UDD */}
      <DonorinModal
        isOpen={!!donorinUser}
        user={donorinUser}
        onClose={() => setDonorinUser(null)}
        onSuccess={() => {
            setDonorinUser(null);
            fetchDonors();
        }}
      />
    </div>
  );
}
