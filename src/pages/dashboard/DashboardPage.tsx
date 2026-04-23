import { useEffect, useState } from "react";
import {
  MapPin,
  Activity,
  Users,
  Clock,
} from "lucide-react";
import api from "@/api/axios";
import type { Region } from "@/types";

const BLOOD_TYPES = ["A", "B", "O", "AB"] as const;
type BloodType = (typeof BLOOD_TYPES)[number];

// Warna per golongan darah
const BLOOD_COLORS: Record<
  BloodType,
  { bg: string; text: string; border: string }
> = {
  A: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  B: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  O: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  AB: { bg: "#FAF5FF", text: "#7C3AED", border: "#DDD6FE" },
};

const SOURCE_LABELS: Record<string, string> = {
  EVENT: 'Event Keliling',
  UDD: 'Markas UDD',
  MANUAL: 'Manual'
};

interface BloodStock {
  id: string;
  bloodType: BloodType;
  productType: string;
  quantity: number;
  updatedAt: string;
}

interface RegionWithStock extends Region {
  bloodStocks: BloodStock[];
}

interface DonorFeedItem {
  id: string;
  name: string;
  bloodType: string | null;
  date: string;
  sourceType: string;
  locationName: string;
  regionName?: string | null;
  regionCode?: string | null;
}

interface RegionSummary {
  id: string;
  kodeUdd: string;
  name: string;
  address: string | null;
  totalWB: number;
  byBloodType: Record<string, number>;
  recentDonors: DonorFeedItem[];
}

interface DashboardStats {
  totalA: number;
  totalB: number;
  totalAB: number;
  totalO: number;
  totalWB: number;
  totalRegions: number;
  regions: RegionSummary[];
  globalDonorFeed: DonorFeedItem[];
  regionsRaw: RegionWithStock[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalA: 0,
    totalB: 0,
    totalAB: 0,
    totalO: 0,
    totalWB: 0,
    totalRegions: 0,
    regions: [],
    globalDonorFeed: [],
    regionsRaw: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination untuk Feed
  const [feedPage, setFeedPage] = useState(1);
  const feedItemsPerPage = 5;
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil ringkasan realtime dari endpoint baru
      const { data: summaryRes } = await api.get("/blood-stocks/summary");
      const summary = summaryRes.data;

      // Juga ambil matriks lengkap untuk tabel detail produk (PRC/TC/FFP)
      const { data: matriksRes } = await api.get("/blood-stocks");
      const regionsRaw: RegionWithStock[] = matriksRes.data;
      setStats({
        totalA: summary.byBloodType.A || 0,
        totalB: summary.byBloodType.B || 0,
        totalAB: summary.byBloodType.AB || 0,
        totalO: summary.byBloodType.O || 0,
        totalWB: summary.totalWB || 0,
        totalRegions: summary.totalRegions || 0,
        regions: summary.regions || [],
        globalDonorFeed: summary.globalDonorFeed || [],
        regionsRaw,
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Gagal memuat matriks persediaan darah.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh setiap 60 detik
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Dashboard Ketersediaan
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Pemantauan matriks plasma darah <em>real-time</em> UDD PMI Pringsewu
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-red-50 text-[var(--primary)] px-4 py-2 rounded-xl border border-red-100 flex items-center text-sm font-semibold shadow-sm">
            <Activity className="w-4 h-4 mr-2 animate-pulse" /> Live Status
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* ── STAT CARDS — Ringkasan Total per Golongan ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BLOOD_TYPES.map((bt) => {
          const totalKey = `total${bt}` as
            | "totalA"
            | "totalB"
            | "totalAB"
            | "totalO";
          const c = BLOOD_COLORS[bt];
          return (
            <div
              key={bt}
              className="rounded-2xl p-5 border flex items-center gap-4 shadow-sm"
              style={{ backgroundColor: c.bg, borderColor: c.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl"
                style={{ backgroundColor: c.border, color: c.text }}
              >
                {bt}
              </div>
              <div>
                {loading ? (
                  <div className="h-7 w-16 bg-white/60 rounded animate-pulse" />
                ) : (
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: c.text }}
                  >
                    {stats[totalKey]}{" "}
                    <span className="text-sm font-semibold opacity-70">Kt</span>
                  </div>
                )}
                <div
                  className="text-xs font-semibold mt-0.5 opacity-70"
                  style={{ color: c.text }}
                >
                  Golongan {bt} (semua tipe)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STOK WB PER CABANG (dari summary endpoint) ── */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--border)] flex gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-[var(--primary)] w-5 h-5" />
            <h3 className="text-lg font-bold text-[var(--text)]">Stok WB per Cabang UDD</h3>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Auto-update saat donor divalidasi</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[var(--border)]">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cabang UDD</th>
                  {BLOOD_TYPES.map(bt => (
                    <th key={bt} className="px-4 py-3 text-xs font-bold text-center uppercase" style={{ color: BLOOD_COLORS[bt].text }}>
                      WB-{bt}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-bold text-center text-gray-400 uppercase">Total WB</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Donor Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {stats.regions.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Belum ada data stok.</td></tr>
                ) : stats.regions.map(region => {
                  const lastDonor = region.recentDonors?.[0];
                  return (
                    <tr key={region.id} className="hover:bg-gray-50 border-b border-[var(--border)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{region.name}</div>
                        <div className="text-xs text-gray-400">{region.kodeUdd}</div>
                      </td>
                      {BLOOD_TYPES.map(bt => {
                        const qty = region.byBloodType?.[bt] || 0;
                        const c = BLOOD_COLORS[bt];
                        return (
                          <td key={bt} className="px-4 py-4 text-center">
                            <span className="inline-block min-w-[2.5rem] px-2 py-1 rounded-lg text-sm font-bold"
                              style={{ backgroundColor: qty > 0 ? c.bg : '#F9FAFB', color: qty > 0 ? c.text : '#9CA3AF', border: `1px solid ${qty > 0 ? c.border : '#E5E7EB'}` }}>
                              {qty}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-gray-700">{region.totalWB}</span>
                        <span className="text-xs text-gray-400 ml-1">Kantong</span>
                      </td>
                      <td className="px-6 py-4">
                        {lastDonor ? (
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{lastDonor.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {lastDonor.bloodType && (
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: BLOOD_COLORS[lastDonor.bloodType as BloodType]?.bg || '#F9FAFB', color: BLOOD_COLORS[lastDonor.bloodType as BloodType]?.text || '#6B7280' }}>
                                  {lastDonor.bloodType}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                {new Date(lastDonor.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum ada donasi</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── FEED DONOR GLOBAL REALTIME ── */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center gap-2">
          <Activity className="text-green-500 w-5 h-5 animate-pulse" />
          <h3 className="text-lg font-bold text-[var(--text)]">Feed Donor Realtime</h3>
          <span className="ml-auto text-xs text-[var(--text-muted)]">20 donasi terbaru dari semua UDD</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Memuat feed...</div>
        ) : stats.globalDonorFeed.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada data donor yang tercatat dari event atau UDD.</p>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-[var(--border)]">
              {stats.globalDonorFeed.slice((feedPage - 1) * feedItemsPerPage, feedPage * feedItemsPerPage).map((item, idx) => {
                const c = item.bloodType ? BLOOD_COLORS[item.bloodType as BloodType] : null;
                return (
                  <div key={item.id || idx} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    {/* Badge golongan darah */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ backgroundColor: c?.bg || '#F9FAFB', color: c?.text || '#6B7280', border: `1px solid ${c?.border || '#E5E7EB'}` }}>
                      {item.bloodType || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{item.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.sourceType === 'EVENT' ? 'bg-blue-50 text-blue-600' :
                          item.sourceType === 'UDD' ? 'bg-green-50 text-green-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {SOURCE_LABELS[item.sourceType] || item.sourceType}
                        </span>
                        {item.regionName && (
                          <span className="text-xs text-gray-500 truncate">{item.regionName}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Paginasi Footer */}
            {stats.globalDonorFeed.length > feedItemsPerPage && (
              <div className="px-6 py-4 border-t border-[var(--border)] bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Menampilkan {Math.min((feedPage - 1) * feedItemsPerPage + 1, stats.globalDonorFeed.length)} - {Math.min(feedPage * feedItemsPerPage, stats.globalDonorFeed.length)} dari {stats.globalDonorFeed.length} donasi
                </span>
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => setFeedPage(p => Math.max(1, p - 1))}
                    disabled={feedPage === 1}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    onClick={() => setFeedPage(p => Math.min(Math.ceil(stats.globalDonorFeed.length / feedItemsPerPage), p + 1))}
                    disabled={feedPage === Math.ceil(stats.globalDonorFeed.length / feedItemsPerPage)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
