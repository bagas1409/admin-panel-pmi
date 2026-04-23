import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  CalendarDays,
  RadioTower,
  Users,
  UserCog,
  ArrowDownCircle,
  Package,
  FileText,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard Matriks", icon: LayoutDashboard, roles: ['ADMIN_PMI'] },
  { to: "/events", label: "Event Keliling", icon: CalendarDays, roles: ['ADMIN_PMI'] },
  { to: "/regions", label: "Manajemen UDD", icon: MapPin, roles: ['ADMIN_PMI'] },
  { to: "/blood-requests", label: "Permintaan Darah", icon: FileText, roles: ['ADMIN_PMI'] },
  { to: "/distribution", label: "Distribusi Stok Darah", icon: ArrowDownCircle, roles: ['ADMIN_DISTRIBUSI'] },
  { to: "/distribution-center", label: "Distribution Center", icon: Package, roles: ['ADMIN_DISTRIBUSI'] },
  { to: "/broadcast", label: "Siaran Darurat", icon: RadioTower, roles: ['ADMIN_PMI'] },
  { to: "/donors", label: "Relawan", icon: Users, roles: ['ADMIN_PMI'] },
  { to: "/users", label: "Pengguna", icon: UserCog, roles: ['ADMIN_PMI'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  
  // Filter menu navigation based on login user's role
  const filteredNavItems = user ? navItems.filter(item => item.roles.includes(user.role)) : [];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--card-bg)] border-r border-[var(--border)] shadow-sm flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <ShieldCheck className="w-8 h-8 text-[var(--primary)]" />
        <span className="ml-3 text-xl font-bold text-[var(--text)]">
          PMI <span className="text-[var(--primary)]">DonorKu</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-md shadow-red-500/20"
                      : "text-[var(--text-muted)] hover:bg-[var(--background)] hover:text-[var(--primary)]"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-muted)] text-center">
          Hak Cipta © {new Date().getFullYear()} FTI Universitas Aisyah
          Pringsewu
        </p>
      </div>
    </aside>
  );
}
