import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineChartBar, HiOutlineAcademicCap } from 'react-icons/hi'

export default function StudentResults() {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/student/results')
            .then(({ data }) => setResults(data))
            .catch(() => toast.error('Failed to load results'))
            .finally(() => setLoading(false))
    }, [])

    const avgPercentage = results.length > 0
        ? (results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length).toFixed(1)
        : 0

    const totalPassed = results.filter(r => r.percentage >= 50).length

    return (
        <DashboardLayout title="My Results" subtitle="View your exam scores and performance">
            {loading ? (
                <div className="stats-grid">{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}</div>
            ) : results.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📊</div>
                    <h4>No results yet</h4>
                    <p>Your results will appear here once teachers publish them</p>
                </div>
            ) : (
                <>
                    <div className="stats-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
                        <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}><HiOutlineAcademicCap /></div>
                            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{results.length}</div>
                            <div className="stat-label">Exams Taken</div>
                        </motion.div>
                        <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}><HiOutlineChartBar /></div>
                            <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{avgPercentage}%</div>
                            <div className="stat-label">Average Score</div>
                        </motion.div>
                        <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}><HiOutlineChartBar /></div>
                            <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{totalPassed}/{results.length}</div>
                            <div className="stat-label">Passed</div>
                        </motion.div>
                    </div>

                    <div className="glass-card" style={{ overflow: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Exam</th><th>Obtained</th><th>Total</th><th>Percentage</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <motion.tr key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.exams?.title || 'Exam'}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{r.obtained_marks}</td>
                                        <td>{r.total_marks}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', maxWidth: 120 }}>
                                                    <motion.div
                                                        style={{ height: '100%', borderRadius: 3, background: r.percentage >= 50 ? 'var(--gradient-success)' : 'var(--gradient-warning)' }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${r.percentage}%` }}
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                    />
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{r.percentage}%</span>
                                            </div>
                                        </td>
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
