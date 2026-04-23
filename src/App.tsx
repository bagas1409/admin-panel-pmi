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

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
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

    // Redirect login user based on their specific role to avoid 'stuck on white screen' problem 
    if (!allowedRoles.includes(user.role)) {
        if (user.role === 'ADMIN_DISTRIBUSI') return <Navigate to="/distribution" replace />
        return <Navigate to="/dashboard" replace />
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
                    <MainLayout>
                        <Routes>
                            {/* RUTE UNTUK ADMIN PMI SAJA */}
                            <Route path="/" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/regions" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <RegionsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/donors" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <DonorsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/users" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <UsersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/events" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <EventsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/broadcast" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <BroadcastPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/blood-requests" element={
                                <ProtectedRoute allowedRoles={['ADMIN_PMI']}>
                                    <BloodRequestsPage />
                                </ProtectedRoute>
                            } />

                            {/* RUTE UNTUK ADMIN DISTRIBUSI SAJA */}
                            <Route path="/distribution" element={
                                <ProtectedRoute allowedRoles={['ADMIN_DISTRIBUSI']}>
                                    <DistributionPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/distribution-center" element={
                                <ProtectedRoute allowedRoles={['ADMIN_DISTRIBUSI']}>
                                    <DistributionCenterPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/distribution-center/stock" element={
                                <ProtectedRoute allowedRoles={['ADMIN_DISTRIBUSI']}>
                                    <DCStockPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/distribution-center/inventory" element={
                                <ProtectedRoute allowedRoles={['ADMIN_DISTRIBUSI']}>
                                    <DCInventoryPage />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </MainLayout>
                }
            />
        </Routes>
    )
}

export default App
