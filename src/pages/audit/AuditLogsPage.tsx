import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { auditService } from '@/api/audit'
import type { AuditLog } from '@/types'
import { Clock, Activity } from 'lucide-react'

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await auditService.getAll()
                setLogs(data)
            } catch (err) {
                setError('Gagal memuat audit logs')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [])

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Audit Log</h1>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary)] border-t-transparent"></div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && logs.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-[var(--text-muted)]">Belum ada aktivitas</p>
                </Card>
            )}

            {/* Timeline */}
            {!loading && !error && logs.length > 0 && (
                <Card className="p-6">
                    <div className="space-y-6">
                        {logs.map((log, index) => (
                            <div key={log.id} className="flex gap-4">
                                {/* Timeline Line */}
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-[var(--primary)]" />
                                    </div>
                                    {index < logs.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-[var(--border)] mt-2"></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-[var(--text)]">{log.action}</p>
                                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                                Target: {log.target} {log.targetId && `#${log.targetId}`}
                                            </p>
                                            {log.details && (
                                                <p className="text-sm text-[var(--text-muted)] mt-1">{log.details}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-[var(--text-muted)] whitespace-nowrap">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(log.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
