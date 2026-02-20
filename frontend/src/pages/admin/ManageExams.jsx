import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineSearch, HiOutlineTrash, HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi'
import { format } from 'date-fns'

const statusBadge = (status) => {
    const map = { draft: 'badge-amber', scheduled: 'badge-blue', active: 'badge-green', completed: 'badge-purple' }
    return <span className={`badge ${map[status] || 'badge-purple'}`}>{status}</span>
}

export default function ManageExams() {
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => { fetchExams() }, [])

    const fetchExams = async () => {
        try {
            const { data } = await api.get('/admin/exams')
            setExams(data)
        } catch (err) {
            toast.error('Failed to load exams')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id, title) => {
        if (!confirm(`Delete exam "${title}"?`)) return
        try {
            await api.delete(`/admin/exams/${id}`)
            toast.success('Exam deleted')
            fetchExams()
        } catch (err) {
            toast.error('Failed to delete')
        }
    }

    const filtered = exams.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()))

    return (
        <DashboardLayout title="All Exams" subtitle="Oversee all exams across the platform">
            <div className="search-bar">
                <HiOutlineSearch className="search-icon" />
                <input
                    className="form-input"
                    placeholder="Search exams..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                />
            </div>

            {loading ? (
                <div className="content-grid">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📋</div>
                    <h4>No exams found</h4>
                    <p>No exams have been created yet</p>
                </div>
            ) : (
                <div className="content-grid">
                    <AnimatePresence>
                        {filtered.map((exam, i) => (
                            <motion.div
                                key={exam.id}
                                className="glass-card exam-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="exam-status">{statusBadge(exam.status)}</div>
                                <h4>{exam.title}</h4>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                    {exam.description || 'No description'}
                                </p>
                                <div className="exam-meta">
                                    <span><HiOutlineCalendar /> {exam.scheduled_start ? format(new Date(exam.scheduled_start), 'MMM dd, yyyy') : 'Not scheduled'}</span>
                                    <span><HiOutlineClock /> {exam.duration_minutes}min</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                    Teacher: {exam.profiles?.name || 'Unknown'}
                                </p>
                                <div className="exam-actions">
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam.id, exam.title)}>
                                        <HiOutlineTrash /> Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </DashboardLayout>
    )
}
