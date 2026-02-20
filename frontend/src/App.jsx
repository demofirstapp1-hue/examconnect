import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AnimatePresence } from 'framer-motion'
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

function ProtectedRoute({ children, allowedRoles }) {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            </div>
        )
    }

    if (!user) return <Navigate to="/login" replace />

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        const home = profile.role === 'admin' ? '/admin' : profile.role === 'teacher' ? '/teacher' : '/student'
        return <Navigate to={home} replace />
    }

    return children
}

export default function App() {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
                <span style={{ color: 'var(--text-muted)' }}>Loading ExamConnect...</span>
            </div>
        )
    }

    const getHomeRoute = () => {
        if (!user || !profile) return '/login'
        if (profile.role === 'admin') return '/admin'
        if (profile.role === 'teacher') return '/teacher'
        return '/student'
    }

    return (
        <AnimatePresence mode="wait">
            <Routes>
                {/* Public */}
                <Route path="/login" element={user ? <Navigate to={getHomeRoute()} replace /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to={getHomeRoute()} replace /> : <Register />} />

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['admin']}><AdminExams /></ProtectedRoute>} />

                {/* Teacher */}
                <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
                <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudents /></ProtectedRoute>} />
                <Route path="/teacher/create-exam" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherCreateExam /></ProtectedRoute>} />
                <Route path="/teacher/exams/:examId/answers" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherReviewAnswers /></ProtectedRoute>} />
                <Route path="/teacher/exams/:examId/results" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherResults /></ProtectedRoute>} />

                {/* Student */}
                <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/exam/:examId" element={<ProtectedRoute allowedRoles={['student']}><StudentTakeExam /></ProtectedRoute>} />
                <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>} />

                {/* Default */}
                <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
            </Routes>
        </AnimatePresence>
    )
}
