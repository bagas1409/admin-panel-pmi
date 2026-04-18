import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa email dan password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-lg">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            PMI DonorKu
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Dashboard Aplikasi PMI Pringsewu
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[var(--card-bg)] p-8 shadow-2xl ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text)]">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mail.com"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-12 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-muted)] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text)]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-12 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-muted)] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full rounded-xl"
            >
              Masuk
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} FTI Universitas Aisyah Pringsewu
        </p>
      </div>
    </div>
  );
}
