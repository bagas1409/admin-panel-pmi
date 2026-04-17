import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/layouts/MainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import RegionsPage from '@/pages/regions/RegionsPage'
import DonorsPage from '@/pages/donors/DonorsPage'
import EventsPage from '@/pages/events/EventsPage'
import BroadcastPage from '@/pages/broadcast/BroadcastPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, token, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent"></div>
            </div>
        )
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'ADMIN_PMI') {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Routes>
                                <Route path="/" element={<DashboardPage />} />
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/regions" element={<RegionsPage />} />
                                <Route path="/donors" element={<DonorsPage />} />
                                <Route path="/events" element={<EventsPage />} />
                                <Route path="/broadcast" element={<BroadcastPage />} />
                            </Routes>
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App
