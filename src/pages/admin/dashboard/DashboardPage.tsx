import { useEffect, useState } from "react";
import {
  MapPin,
  Activity,
  Users,
  Clock,
  Droplet
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
  UDD: 'Markas UTD',
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

  const totalFeedPages = Math.ceil(stats.globalDonorFeed.length / feedItemsPerPage);

  return (
    <div className="bg-[var(--background)] min-h-screen -m-6 p-6 relative">
      <style>{`
          .glass-panel {
              background: rgba(255, 255, 255, 0.7);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.5);
          }
      `}</style>
      <div className="space-y-8 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--primary)] tracking-tight leading-tight">
              Dashboard Ketersediaan
            </h1>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">
              Monitor and analyze real-time plasma and whole blood supply metrics across all UTD PMI Pringsewu branches.
            </p>
          </div>
        <div className="flex gap-3">
          <div className="bg-purple-50 text-[var(--primary)] px-4 py-2 rounded-lg border border-[var(--primary)]/10 flex items-center text-sm font-bold shadow-sm">
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
              className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-default"
              style={{ borderColor: c.border }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl shrink-0"
                style={{ backgroundColor: c.border, color: c.text }}
              >
                {bt}
              </div>
              <div className="flex-1">
                {loading ? (
                  <div className="h-7 w-16 bg-slate-200/60 rounded animate-pulse" />
                ) : (
                  <div
                    className="text-3xl font-black"
                    style={{ color: c.text }}
                  >
                    {stats[totalKey]}{" "}
                    <span className="text-sm font-medium text-[var(--text-muted)]">Kt</span>
                  </div>
                )}
                <div
                  className="text-xs font-semibold mt-0.5 tracking-wider uppercase"
                  style={{ color: c.text, opacity: 0.8 }}
                >
                  Golongan {bt}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STOK WB PER CABANG (dari summary endpoint) ── */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex gap-2 items-center justify-between bg-[var(--background)]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Distribusi Stok per Cabang</h3>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-slate-100 px-2.5 py-1 rounded-md">Auto-sync</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-[var(--text-muted)] animate-pulse font-medium">Memuat data sinkronisasi...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--background)]/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Cabang UTD</th>
                  {BLOOD_TYPES.map(bt => (
                    <th key={bt} className="px-4 py-4 text-[11px] font-bold text-center tracking-wider uppercase" style={{ color: BLOOD_COLORS[bt].text }}>
                      WB-{bt}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-[11px] font-bold text-center text-[var(--text-muted)] tracking-wider uppercase">Total Unit</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase text-right">Log Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.regions.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)] font-medium">Belum ada data stok cabang.</td></tr>
                ) : stats.regions.map(region => {
                  const lastDonor = region.recentDonors?.[0];
                  return (
                    <tr key={region.id} className="hover:bg-[var(--background)]/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text)] text-sm">{region.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider mt-0.5">ID: {region.kodeUdd}</div>
                      </td>
                      {BLOOD_TYPES.map(bt => {
                        const qty = region.byBloodType?.[bt] || 0;
                        const c = BLOOD_COLORS[bt];
                        return (
                          <td key={bt} className="px-4 py-4 text-center">
                            <span className="inline-block min-w-[3rem] px-2.5 py-1.5 rounded-lg text-xs font-black transition-transform group-hover:scale-105"
                              style={{ backgroundColor: qty > 0 ? c.bg : '#f8fafc', color: qty > 0 ? c.text : '#cbd5e1', border: `1px solid ${qty > 0 ? c.border : '#f1f5f9'}` }}>
                              {qty}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-[var(--text)] font-bold rounded-lg text-sm">
                          {region.totalWB}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {lastDonor ? (
                          <div className="flex flex-col items-end">
                            <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                              {lastDonor.bloodType} WB <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5 tracking-wider">
                              {new Date(lastDonor.date).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">-</span>
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
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex gap-2 items-center justify-between bg-[var(--background)]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Live Supply Feed</h3>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-slate-100 px-2.5 py-1 rounded-md">Real-Time</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-[var(--text-muted)] animate-pulse font-medium">Memuat live feed...</div>
        ) : stats.globalDonorFeed.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Droplet className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-[var(--text-muted)] font-bold text-sm">Belum ada donasi hari ini</p>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-[var(--border)]">
              {stats.globalDonorFeed.slice((feedPage - 1) * feedItemsPerPage, feedPage * feedItemsPerPage).map((d) => {
                const c = d.bloodType ? BLOOD_COLORS[d.bloodType as BloodType] : { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
                return (
                  <div key={d.id} className="p-4 sm:px-6 flex flex-col sm:flex-row gap-4 sm:items-center hover:bg-[var(--background)]/80 transition-colors group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: c.bg, color: c.text, border: `1.5px solid ${c.border}` }}>
                      {d.bloodType}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[var(--text)] text-sm flex items-center gap-2">
                        {d.name}
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Donor Baru</span>
                      </div>
                      <div className="text-[11px] font-mono tracking-wider text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700">{d.regionName}</span> •
                        {new Date(d.date).toLocaleString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {stats.globalDonorFeed.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-[var(--background)]/50 flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-muted)]">Halaman {feedPage} / {totalFeedPages}</span>
                <div className="flex gap-2">
                  <button disabled={feedPage === 1} onClick={() => setFeedPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-[var(--text-muted)] hover:bg-[var(--card-bg)] disabled:opacity-50 transition-colors">
                    Prev
                  </button>
                  <button disabled={feedPage === totalFeedPages} onClick={() => setFeedPage(p => Math.min(totalFeedPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-[var(--text-muted)] hover:bg-[var(--card-bg)] disabled:opacity-50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
