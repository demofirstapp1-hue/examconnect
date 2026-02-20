import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar' // Make sure this path is correct

// Import your pages (keeping your existing imports)
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/ManageUsers'
import AdminExams from './pages/admin/ManageExams'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherStudents from './pages/teacher/ManageStudents'
import TeacherCreateExam from './pages/teacher/CreateExam'
import TeacherReviewAnswers from './pages/teacher/ReviewAnswers'
import TeacherResults from './pages/teacher/Results'
import StudentDashboard from './pages/student/Dashboard'
import StudentTakeExam from './pages/student/TakeExam'
import StudentResults from './pages/student/Results'

/**
 * 1. THE LAYOUT COMPONENT
 * This wraps your dashboard pages to provide the Sidebar + Main Content area
 */
function AppLayout({ children }) {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="content-inner">
                    {children}
                </div>
            </main>
        </div>
    )
}

/**
 * 2. PROTECTED ROUTE COMPONENT
 */
function ProtectedRoute({ children, allowedRoles }) {
    const { user, profile, loading } = useAuth()

    if (loading) return <div className="loading-spinner">Loading...</div>
    if (!user) return <Navigate to="/login" replace />

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        const home = profile.role === 'admin' ? '/admin' : profile.role === 'teacher' ? '/teacher' : '/student'
        return <Navigate to={home} replace />
    }

    return children
}

/**
 * 3. MAIN APP COMPONENT
 */
export default function App() {
    const { user, profile, loading } = useAuth()

    if (loading) return <div className="loading-screen">Loading ExamConnect...</div>

    const getHomeRoute = () => {
        if (!user || !profile) return '/login'
        if (profile.role === 'admin') return '/admin'
        if (profile.role === 'teacher') return '/teacher'
        return '/student'
    }

    return (
        <AnimatePresence mode="wait">
            <Routes>
                {/* PUBLIC ROUTES (No Sidebar) */}
                <Route path="/login" element={user ? <Navigate to={getHomeRoute()} replace /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to={getHomeRoute()} replace /> : <Register />} />

                {/* PROTECTED ROUTES (Wrapped in Layout with Sidebar) */}
                <Route path="/*" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Routes>
                                {/* Admin */}
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/users" element={<AdminUsers />} />
                                <Route path="/admin/exams" element={<AdminExams />} />

                                {/* Teacher */}
                                <Route path="/teacher" element={<TeacherDashboard />} />
                                <Route path="/teacher/students" element={<TeacherStudents />} />
                                <Route path="/teacher/create-exam" element={<TeacherCreateExam />} />
                                <Route path="/teacher/exams/:examId/answers" element={<TeacherReviewAnswers />} />
                                <Route path="/teacher/exams/:examId/results" element={<TeacherResults />} />

                                {/* Student */}
                                <Route path="/student" element={<StudentDashboard />} />
                                <Route path="/student/exam/:examId" element={<StudentTakeExam />} />
                                <Route path="/student/results" element={<StudentResults />} />

                                {/* Fallback for authenticated users */}
                                <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
                            </Routes>
                        </AppLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </AnimatePresence>
    )
}
