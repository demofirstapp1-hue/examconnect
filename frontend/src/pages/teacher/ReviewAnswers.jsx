import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineCheck, HiOutlineDocumentText, HiOutlineDownload } from 'react-icons/hi'

export default function ReviewAnswers() {
    const { examId } = useParams()
    const [answers, setAnswers] = useState([])
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [markingId, setMarkingId] = useState(null)
    const [markForm, setMarkForm] = useState({ obtained_marks: 0, feedback: '' })

    useEffect(() => {
        fetchData()
    }, [examId])

    const fetchData = async () => {
        try {
            const [ansRes, qRes] = await Promise.all([
                api.get(`/teacher/exams/${examId}/answers`),
                api.get(`/teacher/exams/${examId}/questions`),
            ])
            setAnswers(ansRes.data)
            setQuestions(qRes.data)
        } catch (err) {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleMark = async (answerId) => {
        try {
            await api.put(`/teacher/answers/${answerId}/mark`, markForm)
            toast.success('Marks saved!')
            setMarkingId(null)
            fetchData()
        } catch (err) {
            toast.error('Failed to save marks')
        }
    }

    const getQuestion = (qId) => questions.find(q => q.id === qId)

    return (
        <DashboardLayout title="Review Answers" subtitle="View submitted answers and assign marks">
            {loading ? (
                <div>{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 16 }} />)}</div>
            ) : answers.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📄</div>
                    <h4>No submissions yet</h4>
                    <p>Students haven't submitted any answers for this exam</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {answers.map((ans, i) => {
                        const q = getQuestion(ans.question_id)
                        return (
                            <motion.div key={ans.id} className="glass-card" style={{ padding: 'var(--space-lg)' }}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <div className="avatar avatar-sm">{ans.profiles?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                            <span style={{ fontWeight: 600 }}>{ans.profiles?.name || 'Student'}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{ans.profiles?.email}</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                            <strong>Q:</strong> {q?.question_text || 'Question'}
                                        </p>
                                    </div>
                                    <span className="badge badge-blue">{q?.marks || 0} marks</span>
                                </div>

                                {/* Answer content */}
                                {ans.answer_text && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-md)', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ans.answer_text}</p>
                                    </div>
                                )}

                                {ans.answer_file_url && (
                                    <a href={ans.answer_file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginBottom: 'var(--space-md)' }}>
                                        <HiOutlineDownload /> Download Answer File
                                    </a>
                                )}

                                {/* Marking section */}
                                {ans.obtained_marks !== null && markingId !== ans.id ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(16,185,129,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <span className="badge badge-green">{ans.obtained_marks}/{q?.marks || 0}</span>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{ans.feedback}</span>
                                        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { setMarkingId(ans.id); setMarkForm({ obtained_marks: ans.obtained_marks, feedback: ans.feedback || '' }) }}>Edit</button>
                                    </div>
                                ) : markingId === ans.id ? (
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <div className="form-group" style={{ marginBottom: 0, flex: '0 0 100px' }}>
                                            <label className="form-label">Marks</label>
                                            <input className="form-input" type="number" min={0} max={q?.marks || 100} value={markForm.obtained_marks} onChange={(e) => setMarkForm({ ...markForm, obtained_marks: parseInt(e.target.value) })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                            <label className="form-label">Feedback</label>
                                            <input className="form-input" value={markForm.feedback} onChange={(e) => setMarkForm({ ...markForm, feedback: e.target.value })} placeholder="Optional feedback" />
                                        </div>
                                        <button className="btn btn-success btn-sm" onClick={() => handleMark(ans.id)}><HiOutlineCheck /> Save</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setMarkingId(null)}>Cancel</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-primary btn-sm" onClick={() => { setMarkingId(ans.id); setMarkForm({ obtained_marks: 0, feedback: '' }) }}>
                                        <HiOutlineCheck /> Mark Answer
                                    </button>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
