import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineAcademicCap, HiOutlineShieldCheck } from 'react-icons/hi'

export default function Register() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('student')
    const [loading, setLoading] = useState(false)

    const roles = [
        { value: 'student', label: 'Student', icon: <HiOutlineAcademicCap /> },
        { value: 'teacher', label: 'Teacher', icon: <HiOutlineUser /> },
        { value: 'admin', label: 'Admin', icon: <HiOutlineShieldCheck /> },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await signUp(email, password, name, role)
            navigate('/login')
        } catch (err) {
            // handled in context
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <motion.div
                className="glass-card auth-card"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="auth-logo">
                    <motion.div
                        className="logo-large animate-glow"
                    >
                        E
                    </motion.div>
                    <h2 className="text-gradient">Create Account</h2>
                    <p>Join ExamConnect today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Role Selector */}
                    <div className="form-group">
                        <label className="form-label">I am a</label>
                        <div className="role-selector">
                            {roles.map((r) => (
                                <motion.div
                                    key={r.value}
                                    className={`role-option ${role === r.value ? 'selected' : ''}`}
                                    onClick={() => setRole(r.value)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <div className="role-icon">{r.icon}</div>
                                    {r.label}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ paddingLeft: '2.25rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: '2.25rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineLockClosed style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Create a password (min 6 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ paddingLeft: '2.25rem' }}
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: 'var(--space-md)' }}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </motion.button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </motion.div>
        </div>
    )
}
