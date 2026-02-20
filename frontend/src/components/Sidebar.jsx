import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineUsers, HiOutlineLogout, HiOutlinePlus, HiOutlineHome, 
    HiChevronLeft, HiChevronRight, HiMenu, HiX 
} from 'react-icons/hi';

export default function Sidebar() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => { setIsMobileOpen(false); }, [location]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Correctly mapped nav items based on your existing setup
    const navItems = profile?.role === 'admin' 
        ? [{ to: '/admin', icon: <HiOutlineHome />, label: 'Dashboard' }, { to: '/admin/users', icon: <HiOutlineUsers />, label: 'Users' }]
        : profile?.role === 'teacher'
        ? [{ to: '/teacher', icon: <HiOutlineHome />, label: 'Dashboard' }, { to: '/teacher/students', icon: <HiOutlineUsers />, label: 'Students' }, { to: '/teacher/create-exam', icon: <HiOutlinePlus />, label: 'Create' }]
        : [{ to: '/student', icon: <HiOutlineHome />, label: 'Dashboard' }];

    return (
        <>
            {/* Mobile Header */}
            <div className="mobile-header">
                <button onClick={() => setIsMobileOpen(true)} className="menu-btn"><HiMenu size={24} /></button>
                <span className="logo-text">ExamConnect</span>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileOpen(false)} className="overlay" />}
            </AnimatePresence>

            <motion.aside 
                className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
                animate={{ width: isCollapsed ? '80px' : '260px' }}
            >
                <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
                </button>

                <div className="sidebar-logo">
                    <div className="logo-icon">E</div>
                    {!isCollapsed && <span className="logo-text">ExamConnect</span>}
                </div>

                <nav className="nav-list">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className="nav-item">
                            <span className="icon">{item.icon}</span>
                            {!isCollapsed && <span className="label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="user-section">
                    <div className="avatar">{profile?.name?.charAt(0).toUpperCase()}</div>
                    {!isCollapsed && <span className="user-name">{profile?.name}</span>}
                    <button onClick={handleSignOut} className="logout-btn"><HiOutlineLogout /></button>
                </div>
            </motion.aside>
        </>
    );
}
