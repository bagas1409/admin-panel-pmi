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
  Building2,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard Matriks", icon: LayoutDashboard, roles: ['ADMIN_PMI'] },
  { to: "/events", label: "Event Keliling", icon: CalendarDays, roles: ['ADMIN_PMI'] },
  { to: "/regions", label: "Manajemen UDD", icon: MapPin, roles: ['ADMIN_PMI'] },
  { to: "/blood-requests", label: "Permintaan Darah", icon: FileText, roles: ['ADMIN_PMI'] },
  { to: "/distribution", label: "Distribusi Stok Darah", icon: ArrowDownCircle, roles: ['ADMIN_DISTRIBUSI'] },
  { to: "/hospital-requests", label: "Permintaan RS Swasta", icon: Building2, roles: ['ADMIN_DISTRIBUSI'] },
  { to: "/distribution-center", label: "Distribution Center", icon: Package, roles: ['ADMIN_DISTRIBUSI'] },
  { to: "/broadcast", label: "Siaran Darurat", icon: RadioTower, roles: ['ADMIN_PMI'] },
  { to: "/hospital-role-approvals", label: "Persetujuan RS Swasta", icon: ClipboardCheck, roles: ['ADMIN_PMI'] },
  { to: "/donors", label: "Relawan", icon: Users, roles: ['ADMIN_PMI'] },
  { to: "/users", label: "Pengguna", icon: UserCog, roles: ['ADMIN_PMI'] },
  
  // RS_SWASTA
  { to: "/hospital-dashboard", label: "Dashboard RS", icon: LayoutDashboard, roles: ['RS_SWASTA'] },
  { to: "/hospital-my-requests", label: "Permintaan Darah", icon: FileText, roles: ['RS_SWASTA'] },
  { to: "/hospital-blood-stocks", label: "Stok Darah RS", icon: Package, roles: ['RS_SWASTA'] },
  { to: "/hospital-profile", label: "Profil Instansi", icon: Building2, roles: ['RS_SWASTA'] },
];

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user } = useAuth();
  
  // Filter menu navigation based on login user's role
  const filteredNavItems = user ? navItems.filter(item => item.roles.includes(user.role)) : [];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#462C7D] via-[#241642] to-[#170e2b] border-r border-white/5 shadow-2xl flex flex-col text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className={`h-20 flex items-center border-b border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 ${collapsed ? 'flex-col justify-center gap-1.5 py-3 px-0' : 'px-4 justify-between'}`}>
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#462C7D] to-[#CE2626] shadow-md border border-white/10 shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <span className="ml-3 text-xl font-extrabold text-white tracking-wide truncate">
              PMI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-rose-300">DonorKu</span>
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-white/10 text-purple-200 hover:text-white transition-colors ${collapsed ? 'mt-1' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-1.5">
          {filteredNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 text-sm font-medium ${
                    collapsed ? 'justify-center p-3 mx-2 rounded-xl' : 'gap-3 px-4 py-3.5 mx-0 rounded-xl'
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-[#462C7D] to-[#CE2626] text-white shadow-md shadow-[#462C7D]/20 font-semibold"
                      : "text-purple-200/80 hover:bg-white/10 hover:text-white"
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5 bg-transparent">
          <p className="text-[10px] text-purple-300/40 text-center font-bold uppercase tracking-wider">
            FTI UAP © {new Date().getFullYear()}
          </p>
        </div>
      )}
    </aside>
  );
}
