import { Building2 } from "lucide-react";

export default function HospitalProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-[var(--primary)]" />
                    Profil Instansi
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                    Detail profil rumah sakit dan informasi kontak Penanggung Jawab (PIC).
                </p>
            </div>
            
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-8 text-center text-[var(--text-muted)]">
                Modul ini sedang dalam tahap pengembangan sesuai PRD.
            </div>
        </div>
    );
}
