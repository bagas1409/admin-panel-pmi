import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] ${className}`}>
            {children}
        </div>
    )
}

interface StatCardProps {
    title: string
    value: string | number
    icon: ReactNode
    loading?: boolean
}

export function StatCard({ title, value, icon, loading }: StatCardProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-[var(--text-muted)]">{title}</p>
                    {loading ? (
                        <div className="h-8 w-20 bg-[var(--border)] animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-2xl font-bold text-[var(--text)] mt-1">{value}</p>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                    {icon}
                </div>
            </div>
        </Card>
    )
}
