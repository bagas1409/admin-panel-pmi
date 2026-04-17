import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  CalendarDays,
  RadioTower,
  Users
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard Matriks", icon: LayoutDashboard },
  { to: "/events", label: "Event Keliling", icon: CalendarDays },
  { to: "/regions", label: "Manajemen UDD", icon: MapPin },
  { to: "/broadcast", label: "Siaran Darurat", icon: RadioTower },
  { to: "/donors", label: "Relawan", icon: Users }
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--card-bg)] border-r border-[var(--border)] shadow-sm flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <ShieldCheck className="w-8 h-8 text-[var(--primary)]" />
        <span className="ml-3 text-xl font-bold text-[var(--text)]">
          PMI <span className="text-[var(--primary)]">Donorku</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
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
          Hak Cipta © {new Date().getFullYear()} PMI Pringsewu
        </p>
      </div>
    </aside>
  );
}
