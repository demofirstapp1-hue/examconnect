import { useState } from 'react' // 1. Added useState
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion' // 2. Added AnimatePresence
import {
    HiOutlineUsers, HiOutlineClipboardList,
    HiOutlineChartBar, HiOutlineLogout, HiOutlinePlus,
    HiOutlineHome, HiChevronLeft, HiChevronRight // 3. Added Toggle Icons
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
    const [isCollapsed, setIsCollapsed] = useState(false) // 4. State for folding

    const navItems = profile?.role === 'admin' ? adminNav
        : profile?.role === 'teacher' ? teacherNav
            : studentNav

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <motion.aside
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            initial={false}
            animate={{ 
                width: isCollapsed ? '80px' : '260px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Toggle Button */}
            <button 
                className="toggle-btn" 
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
            </button>

            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">E</div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="logo-text text-gradient"
                        >
                            ExamConnect
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {!isCollapsed && <span className="nav-section-label">Navigation</span>}
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to.split('/').length <= 2}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.label : ""} // Show tooltip on hover when collapsed
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Info & Logout */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-md)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
                    <div className="avatar">
                        {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    {!isCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {profile?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {profile?.role || 'user'}
                            </div>
                        </motion.div>
                    )}
                </div>
                <button className="nav-item" onClick={handleSignOut} title={isCollapsed ? "Sign Out" : ""}>
                    <span className="nav-icon"><HiOutlineLogout /></span>
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </motion.aside>
    )
}
