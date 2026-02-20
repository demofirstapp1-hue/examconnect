import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineChartBar, HiOutlineCheck } from 'react-icons/hi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TeacherResults() {
    const { examId } = useParams()
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [publishing, setPublishing] = useState(false)

    useEffect(() => { fetchResults() }, [examId])

    const fetchResults = async () => {
        try {
            const { data } = await api.get(`/teacher/exams/${examId}/results`)
            setResults(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handlePublish = async () => {
        setPublishing(true)
        try {
            await api.post(`/teacher/exams/${examId}/publish-results`)
            toast.success('Results published!')
            fetchResults()
        } catch (err) {
            toast.error('Failed to publish')
        } finally {
            setPublishing(false)
        }
    }

    const chartData = results.map(r => ({
        name: r.profiles?.name || 'Student',
        marks: r.obtained_marks || 0,
        total: r.total_marks || 0,
    }))

    const avgPercentage = results.length > 0
        ? (results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length).toFixed(1)
        : 0

    return (
        <DashboardLayout title="Exam Results" subtitle="View and publish results for this exam">
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <motion.button className="btn btn-primary btn-lg" onClick={handlePublish} disabled={publishing}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <HiOutlineCheck /> {publishing ? 'Publishing...' : 'Calculate & Publish Results'}
                </motion.button>
            </div>

            {loading ? (
                <div className="skeleton skeleton-card" style={{ height: 300 }} />
            ) : results.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📊</div>
                    <h4>No results yet</h4>
                    <p>Click "Calculate & Publish Results" after marking all answers</p>
                </div>
            ) : (
                <>
                    <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
                        <div className="glass-card stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{results.length}</div>
                            <div className="stat-label">Students</div>
                        </div>
                        <div className="glass-card stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{avgPercentage}%</div>
                            <div className="stat-label">Average Score</div>
                        </div>
                        <div className="glass-card stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                                {results.filter(r => r.percentage >= 50).length}
                            </div>
                            <div className="stat-label">Passed</div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                        <h4 style={{ marginBottom: 'var(--space-lg)' }}>Score Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: 'rgba(20,20,50,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                <Bar dataKey="marks" fill="url(#resGrad)" radius={[8, 8, 0, 0]} name="Obtained" />
                                <Bar dataKey="total" fill="rgba(255,255,255,0.08)" radius={[8, 8, 0, 0]} name="Total" />
                                <defs>
                                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#06B6D4" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card" style={{ overflow: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Student</th><th>Obtained</th><th>Total</th><th>Percentage</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="avatar avatar-sm">{r.profiles?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.profiles?.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{r.obtained_marks}</td>
                                        <td>{r.total_marks}</td>
                                        <td style={{ fontWeight: 600 }}>{r.percentage}%</td>
                                        <td>
                                            <span className={`badge ${r.percentage >= 50 ? 'badge-green' : 'badge-red'}`}>
                                                {r.percentage >= 50 ? 'PASS' : 'FAIL'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </DashboardLayout>
    )
}
