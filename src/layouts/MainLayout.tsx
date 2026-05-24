import { ReactNode, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

interface MainLayoutProps {
    children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
                <Header />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
