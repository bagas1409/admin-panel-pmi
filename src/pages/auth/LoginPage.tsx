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
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[#1e1135] p-4 overflow-hidden">
      {/* Decorative Glowing Blobs */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-[var(--primary)]/30 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-[var(--primary-dark)]/25 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-dark)] shadow-xl border border-white/10 transition-transform hover:scale-105 duration-300">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            PMI DonorKu
          </h1>
          <p className="mt-1.5 text-sm text-purple-200/80 font-medium">
            Dashboard Aplikasi PMI Pringsewu
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl border border-white/15 ring-1 ring-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200 backdrop-blur-md">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-100 pl-1">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mail.com"
                  required
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-400 focus:bg-white/10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-100 pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-400 focus:bg-white/10"
                />
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full rounded-2xl font-bold py-3.5 mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white border-0 shadow-lg shadow-purple-950/50 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              Masuk
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-purple-200/50 font-medium tracking-wide">
          © {new Date().getFullYear()} FTI Universitas Aisyah Pringsewu
        </p>
      </div>
    </div>
  );
}
