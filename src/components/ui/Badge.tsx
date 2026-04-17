interface BadgeProps {
    variant?: 'success' | 'warning' | 'danger' | 'default' | 'primary'
    children: React.ReactNode
}

const variantStyles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-[var(--primary)]/10 text-[var(--primary)]',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}>
            {children}
        </span>
    )
}
