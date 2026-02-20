import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
    HiOutlineAcademicCap, HiOutlineUsers, HiOutlineClipboardList,
    HiOutlineChartBar, HiOutlineCog, HiOutlineLogout, HiOutlinePlus,
    HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineHome
} from 'react-icons/hi'

const adminNav = [
    { to: '/admin', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/admin/users', icon: <HiOutlineUsers />, label: 'Manage Users' },
    { to: '/admin/exams', icon: <HiOutlineClipboardList />, label: 'All Exams' },
]

const teacherNav = [
    { to: '/teacher', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/teacher/students', icon: <HiOutlineUsers />, label: 'Students' },
    { to: '/teacher/create-exam', icon: <HiOutlinePlus />, label: 'Create Exam' },
]

const studentNav = [
    { to: '/student', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/student/results', icon: <HiOutlineChartBar />, label: 'My Results' },
]

export default function Sidebar() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()

    const navItems = profile?.role === 'admin' ? adminNav
        : profile?.role === 'teacher' ? teacherNav
            : studentNav

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <motion.aside
            className="sidebar"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">E</div>
                <span className="logo-text text-gradient">ExamConnect</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <span className="nav-section-label">Navigation</span>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to.split('/').length <= 2}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Info & Logout */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
                    <div className="avatar">
                        {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{profile?.name || 'User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            {profile?.role || 'user'}
                        </div>
                    </div>
                </div>
                <button className="nav-item" onClick={handleSignOut}>
                    <span className="nav-icon"><HiOutlineLogout /></span>
                    Sign Out
                </button>
            </div>
        </motion.aside>
    )
}
