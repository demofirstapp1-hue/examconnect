import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCalendar, HiOutlinePlay, HiOutlineChartBar } from 'react-icons/hi'
import { format, differenceInSeconds, isPast, isFuture } from 'date-fns'

function CountdownTimer({ targetDate }) {
    const [timeLeft, setTimeLeft] = useState({})

    useEffect(() => {
        const calc = () => {
            const diff = differenceInSeconds(new Date(targetDate), new Date())
            if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
            setTimeLeft({
                d: Math.floor(diff / 86400),
                h: Math.floor((diff % 86400) / 3600),
                m: Math.floor((diff % 3600) / 60),
                s: diff % 60,
            })
        }
        calc()
        const timer = setInterval(calc, 1000)
        return () => clearInterval(timer)
    }, [targetDate])

    return (
        <div className="countdown">
            {[['d', 'Days'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']].map(([k, label]) => (
                <div key={k} className="countdown-segment">
                    <span className="countdown-value">{String(timeLeft[k] || 0).padStart(2, '0')}</span>
                    <span className="countdown-label">{label}</span>
                </div>
            ))}
        </div>
    )
}

export default function StudentDashboard() {
    const navigate = useNavigate()
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/student/exams').then(({ data }) => setExams(data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const upcoming = exams.filter(e => e.status === 'scheduled' && e.scheduled_start && isFuture(new Date(e.scheduled_start)))
    const active = exams.filter(e => e.status === 'active' || (e.status === 'scheduled' && e.scheduled_start && isPast(new Date(e.scheduled_start))))
    const completed = exams.filter(e => e.status === 'completed')

    const statusBadge = (status) => {
        const map = { draft: 'badge-amber', scheduled: 'badge-blue', active: 'badge-green', completed: 'badge-purple' }
        return <span className={`badge ${map[status] || 'badge-purple'}`}>{status}</span>
    }

    const ExamCard = ({ exam, showCountdown, showTake }) => (
        <motion.div className="glass-card exam-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="exam-status">{statusBadge(exam.status)}</div>
            <h4>{exam.title}</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{exam.description || 'No description'}</p>
            <div className="exam-meta">
                <span><HiOutlineCalendar /> {exam.scheduled_start ? format(new Date(exam.scheduled_start), 'MMM dd, yyyy HH:mm') : '—'}</span>
                <span><HiOutlineClock /> {exam.duration_minutes}min</span>
            </div>
            {exam.profiles?.name && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Teacher: {exam.profiles.name}</p>
            )}
            {showCountdown && exam.scheduled_start && (
                <div style={{ marginTop: 'var(--space-md)' }}>
                    <CountdownTimer targetDate={exam.scheduled_start} />
                </div>
            )}
            {showTake && (
                <div className="exam-actions">
                    <motion.button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/exam/${exam.id}`)}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <HiOutlinePlay /> Take Exam
                    </motion.button>
                </div>
            )}
        </motion.div>
    )

    return (
        <DashboardLayout title="Student Dashboard" subtitle="Your exams and upcoming tests">
            <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
                {[
                    { label: 'Upcoming', value: upcoming.length, color: '#2563EB', bg: 'rgba(37,99,235,0.12)', icon: <HiOutlineCalendar /> },
                    { label: 'Active', value: active.length, color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <HiOutlinePlay /> },
                    { label: 'Completed', value: completed.length, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', icon: <HiOutlineChartBar /> },
                ].map((s, i) => (
                    <motion.div key={s.label} className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {loading ? (
                <div className="content-grid">{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}</div>
            ) : exams.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📚</div>
                    <h4>No exams assigned</h4>
                    <p>Your teacher will assign exams to you</p>
                </div>
            ) : (
                <>
                    {active.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-2xl)' }}>
                            <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--accent-green)' }}>🟢 Active Exams</h3>
                            <div className="content-grid">{active.map(e => <ExamCard key={e.id} exam={e} showTake />)}</div>
                        </div>
                    )}
                    {upcoming.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-2xl)' }}>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>📅 Upcoming Exams</h3>
                            <div className="content-grid">{upcoming.map(e => <ExamCard key={e.id} exam={e} showCountdown />)}</div>
                        </div>
                    )}
                    {completed.length > 0 && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>✅ Completed Exams</h3>
                            <div className="content-grid">{completed.map(e => <ExamCard key={e.id} exam={e} />)}</div>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    )
}
