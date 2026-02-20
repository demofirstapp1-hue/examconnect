import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import { HiOutlineUsers, HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineLightningBolt, HiOutlineCheck } from 'react-icons/hi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#7C3AED', '#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EC4899']

function AnimatedCounter({ value, duration = 1.5 }) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let start = 0
        const end = parseInt(value)
        if (start === end) return
        const step = Math.ceil(end / (duration * 60))
        const timer = setInterval(() => {
            start += step
            if (start >= end) { setCount(end); clearInterval(timer) }
            else setCount(start)
        }, 1000 / 60)
        return () => clearInterval(timer)
    }, [value])
    return <span>{count}</span>
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/dashboard-stats')
            setStats(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const statCards = stats ? [
        { label: 'Total Users', value: stats.total_users, icon: <HiOutlineUsers />, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
        { label: 'Teachers', value: stats.total_teachers, icon: <HiOutlineAcademicCap />, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
        { label: 'Students', value: stats.total_students, icon: <HiOutlineUsers />, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
        { label: 'Total Exams', value: stats.total_exams, icon: <HiOutlineClipboardList />, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
        { label: 'Active Exams', value: stats.active_exams, icon: <HiOutlineLightningBolt />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
        { label: 'Submissions', value: stats.total_submissions, icon: <HiOutlineDocumentText />, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
    ] : []

    const pieData = stats ? [
        { name: 'Teachers', value: stats.total_teachers || 0 },
        { name: 'Students', value: stats.total_students || 0 },
        { name: 'Admins', value: Math.max(0, (stats.total_users || 0) - (stats.total_teachers || 0) - (stats.total_students || 0)) },
    ] : []

    const barData = stats ? [
        { name: 'Total', value: stats.total_exams || 0 },
        { name: 'Active', value: stats.active_exams || 0 },
        { name: 'Submissions', value: stats.total_submissions || 0 },
    ] : []

    return (
        <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and analytics">
            {loading ? (
                <div className="stats-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton skeleton-card" />)}
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        {statCards.map((card, i) => (
                            <motion.div
                                key={card.label}
                                className="glass-card stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                                    {card.icon}
                                </div>
                                <div className="stat-value" style={{ color: card.color }}>
                                    <AnimatedCounter value={card.value} />
                                </div>
                                <div className="stat-label">{card.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                        <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--space-lg)' }}>User Distribution</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'rgba(20,20,50,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', marginTop: 'var(--space-sm)' }}>
                                {pieData.map((d, i) => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }} />
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--space-lg)' }}>Exam Overview</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: 'rgba(20,20,50,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                    <Bar dataKey="value" fill="url(#gradientBar)" radius={[8, 8, 0, 0]} />
                                    <defs>
                                        <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#7C3AED" />
                                            <stop offset="100%" stopColor="#2563EB" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    )
}
import DashboardStats from '../../components/DashboardStats'
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlineClipboardCheck } from 'react-icons/hi'

const adminStats = [
    { label: 'Total Students', value: '1,250', icon: <HiOutlineUsers /> },
    { label: 'Active Exams', value: '12', icon: <HiOutlineBookOpen /> },
    { label: 'Completed', value: '450', icon: <HiOutlineClipboardCheck /> },
]

// Inside your Dashboard function:
return (
    <div className="dashboard-page">
        <h1>Welcome back, Admin</h1>
        <DashboardStats stats={adminStats} />
        {/* Other dashboard content */}
    </div>
)
