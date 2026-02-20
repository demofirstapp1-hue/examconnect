import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import { HiOutlineUsers, HiOutlineClipboardList, HiOutlinePlus, HiOutlineClock, HiOutlineCalendar, HiOutlineEye, HiOutlineChartBar } from 'react-icons/hi'
import { format } from 'date-fns'

const statusBadge = (status) => {
    const map = { draft: 'badge-amber', scheduled: 'badge-blue', active: 'badge-green', completed: 'badge-purple' }
    return <span className={`badge ${map[status] || 'badge-purple'}`}>{status}</span>
}

export default function TeacherDashboard() {
    const navigate = useNavigate()
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/teacher/exams').then(({ data }) => setExams(data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const stats = [
        { label: 'Total Exams', value: exams.length, icon: <HiOutlineClipboardList />, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
        { label: 'Active', value: exams.filter(e => e.status === 'active').length, icon: <HiOutlineClock />, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
        { label: 'Scheduled', value: exams.filter(e => e.status === 'scheduled').length, icon: <HiOutlineCalendar />, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
        { label: 'Completed', value: exams.filter(e => e.status === 'completed').length, icon: <HiOutlineChartBar />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    ]

    return (
        <DashboardLayout title="Teacher Dashboard" subtitle="Manage your exams and students">
            <div className="stats-grid">
                {stats.map((s, i) => (
                    <motion.div key={s.label} className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h3>Your Exams</h3>
                <motion.button className="btn btn-primary" onClick={() => navigate('/teacher/create-exam')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <HiOutlinePlus /> Create Exam
                </motion.button>
            </div>

            {loading ? (
                <div className="content-grid">{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}</div>
            ) : exams.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📝</div>
                    <h4>No exams yet</h4>
                    <p>Create your first exam to get started</p>
                </div>
            ) : (
                <div className="content-grid">
                    {exams.map((exam, i) => (
                        <motion.div key={exam.id} className="glass-card exam-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="exam-status">{statusBadge(exam.status)}</div>
                            <h4>{exam.title}</h4>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{exam.description || 'No description'}</p>
                            <div className="exam-meta">
                                <span><HiOutlineCalendar /> {exam.scheduled_start ? format(new Date(exam.scheduled_start), 'MMM dd, yyyy HH:mm') : 'Not scheduled'}</span>
                                <span><HiOutlineClock /> {exam.duration_minutes}min</span>
                            </div>
                            <div className="exam-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/exams/${exam.id}/answers`)}><HiOutlineEye /> Answers</button>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}><HiOutlineChartBar /> Results</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
