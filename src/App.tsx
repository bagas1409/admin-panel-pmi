import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/layouts/MainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import RegionsPage from '@/pages/regions/RegionsPage'
import DonorsPage from '@/pages/donors/DonorsPage'
import UsersPage from '@/pages/users/UsersPage'
import EventsPage from '@/pages/events/EventsPage'
import BroadcastPage from '@/pages/broadcast/BroadcastPage'
import DistributionPage from '@/pages/distribution/DistributionPage'
import DistributionCenterPage from '@/pages/distribution/DistributionCenterPage'
import DCStockPage from '@/pages/distribution/DCStockPage'
import DCInventoryPage from '@/pages/distribution/DCInventoryPage'
import BloodRequestsPage from '@/pages/bloodRequests/BloodRequestsPage'

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
                                <Route path="/users" element={<UsersPage />} />
                                <Route path="/events" element={<EventsPage />} />
                                <Route path="/broadcast" element={<BroadcastPage />} />
                                <Route path="/distribution" element={<DistributionPage />} />
                                <Route path="/distribution-center" element={<DistributionCenterPage />} />
                                <Route path="/distribution-center/stock" element={<DCStockPage />} />
                                <Route path="/distribution-center/inventory" element={<DCInventoryPage />} />
                                <Route path="/blood-requests" element={<BloodRequestsPage />} />
                            </Routes>
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App
