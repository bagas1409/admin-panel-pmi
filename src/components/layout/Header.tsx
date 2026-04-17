import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="h-16 bg-[var(--card-bg)] border-b border-[var(--border)] shadow-sm flex items-center justify-between px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-[var(--text)]">
          Dashboard Aplikasi PMI Pringsewu
        </h1>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">
              {user?.donorProfile?.fullName || "Admin PMI"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {user?.email || ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
