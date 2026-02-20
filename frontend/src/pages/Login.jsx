import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi'

function Particle({ delay }) {
    const x = Math.random() * 100
    const size = Math.random() * 4 + 2
    const duration = Math.random() * 15 + 10

    return (
        <motion.div
            style={{
                position: 'absolute',
                left: `${x}%`,
                bottom: '-10px',
                width: size,
                height: size,
                borderRadius: '50%',
                background: `rgba(124, 58, 237, ${Math.random() * 0.3 + 0.1})`,
            }}
            animate={{
                y: [0, -window.innerHeight - 100],
                x: [0, (Math.random() - 0.5) * 200],
                opacity: [0, 1, 0],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'linear',
            }}
        />
    )
}

export default function Login() {
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await signIn(email, password)
        } catch (err) {
            // toast handled in AuthContext
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            {/* Floating Particles Background */}
            <div className="particles">
                {Array.from({ length: 30 }).map((_, i) => (
                    <Particle key={i} delay={i * 0.5} />
                ))}
            </div>

            <motion.div
                className="glass-card auth-card"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="auth-logo">
                    <motion.div
                        className="logo-large"
                        animate={{ boxShadow: ['0 0 20px rgba(124,58,237,0.3)', '0 0 40px rgba(124,58,237,0.5)', '0 0 20px rgba(124,58,237,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        E
                    </motion.div>
                    <h2 className="text-gradient">Welcome Back</h2>
                    <p>Sign in to ExamConnect</p>
                </div>

                <form onSubmit={handleSubmit}>
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
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                        {loading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </motion.div>
        </div>
    )
}
