import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineSearch, HiOutlineUserAdd, HiOutlineTrash, HiOutlineX } from 'react-icons/hi'

export default function ManageStudents() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: 'student123' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { fetchStudents() }, [])

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/teacher/students')
            setStudents(data)
        } catch (err) {
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    const handleAddStudent = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await api.post('/teacher/students', form)
            toast.success('Student added!')
            setShowModal(false)
            setForm({ name: '', email: '', password: 'student123' })
            fetchStudents()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add student')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Remove student "${name}"?`)) return
        try {
            await api.delete(`/teacher/students/${id}`)
            toast.success('Student removed')
            fetchStudents()
        } catch (err) {
            toast.error('Failed to remove student')
        }
    }

    const filtered = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <DashboardLayout title="Students" subtitle="Add, search, and manage your students">
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 240, marginBottom: 0 }}>
                    <HiOutlineSearch className="search-icon" />
                    <input className="form-input" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                </div>
                <motion.button className="btn btn-primary" onClick={() => setShowModal(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <HiOutlineUserAdd /> Add Student
                </motion.button>
            </div>

            <div className="glass-card" style={{ overflow: 'auto' }}>
                {loading ? (
                    <div style={{ padding: 'var(--space-xl)' }}>{[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-text" style={{ width: `${80 - i * 5}%`, marginBottom: 16 }} />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎓</div>
                        <h4>No students found</h4>
                        <p>Add students to get started</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr><th>Student</th><th>Email</th><th>Joined</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((s, i) => (
                                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="avatar">{s.name?.charAt(0)?.toUpperCase()}</div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                                            </div>
                                        </td>
                                        <td>{s.email}</td>
                                        <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.name)}><HiOutlineTrash /> Remove</button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Student Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
                        <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Add New Student</h3>
                                <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
                            </div>
                            <form onSubmit={handleAddStudent}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student full name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@college.edu" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Initial Password</label>
                                        <input className="form-input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Student'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
