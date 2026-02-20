import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineUpload, HiOutlineCheck, HiOutlineDocumentText, HiOutlineDownload } from 'react-icons/hi'

export default function TakeExam() {
    const { examId } = useParams()
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState({})
    const [submitted, setSubmitted] = useState({})
    const fileRefs = useRef({})
    const [dragActive, setDragActive] = useState(null)

    useEffect(() => {
        fetchQuestions()
        fetchMyAnswers()
    }, [examId])

    const fetchQuestions = async () => {
        try {
            const { data } = await api.get(`/student/exams/${examId}/questions`)
            setQuestions(data)
        } catch (err) {
            toast.error('Failed to load questions')
        } finally {
            setLoading(false)
        }
    }

    const fetchMyAnswers = async () => {
        try {
            const { data } = await api.get(`/student/exams/${examId}/my-answers`)
            const map = {}
            data.forEach(a => { map[a.question_id] = true })
            setSubmitted(map)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSubmit = async (questionId) => {
        const fileInput = fileRefs.current[questionId]
        const file = fileInput?.files?.[0]

        if (!file) {
            toast.error('Please select a file to upload')
            return
        }

        setSubmitting({ ...submitting, [questionId]: true })
        const formData = new FormData()
        formData.append('question_id', questionId)
        formData.append('answer_file', file)

        try {
            await api.post(`/student/exams/${examId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success('Answer submitted!')
            setSubmitted({ ...submitted, [questionId]: true })
        } catch (err) {
            toast.error('Failed to submit')
        } finally {
            setSubmitting({ ...submitting, [questionId]: false })
        }
    }

    const handleDrag = (e, qId, active) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(active ? qId : null)
    }

    const handleDrop = (e, qId) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(null)
        if (e.dataTransfer.files?.[0]) {
            const dt = new DataTransfer()
            dt.items.add(e.dataTransfer.files[0])
            if (fileRefs.current[qId]) {
                fileRefs.current[qId].files = dt.files
            }
        }
    }

    return (
        <DashboardLayout title="Exam" subtitle="View questions and upload your answers">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-lg)' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/student')}>
                    ← Back to Dashboard
                </button>
            </div>

            {loading ? (
                <div>{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 16 }} />)}</div>
            ) : questions.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📝</div>
                    <h4>No questions yet</h4>
                    <p>The teacher hasn't added questions to this exam yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {questions.map((q, i) => (
                        <motion.div key={q.id} className="glass-card" style={{ padding: 'var(--space-xl)' }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                        width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0,
                                    }}>{i + 1}</span>
                                    Question {i + 1}
                                </h4>
                                <span className="badge badge-purple">{q.marks} marks</span>
                            </div>

                            {q.question_text && (
                                <div style={{
                                    padding: 'var(--space-md)', background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
                                    marginBottom: 'var(--space-md)', fontSize: '0.9375rem', lineHeight: 1.7,
                                }}>
                                    {q.question_text}
                                </div>
                            )}

                            {q.question_file_url && (
                                <a href={q.question_file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginBottom: 'var(--space-md)' }}>
                                    <HiOutlineDownload /> Download Question File
                                </a>
                            )}

                            {submitted[q.id] ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                                        color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.875rem',
                                    }}>
                                    <HiOutlineCheck /> Answer Submitted ✓
                                </motion.div>
                            ) : (
                                <div>
                                    <div
                                        className={`file-upload-zone ${dragActive === q.id ? 'active' : ''}`}
                                        onClick={() => fileRefs.current[q.id]?.click()}
                                        onDragEnter={(e) => handleDrag(e, q.id, true)}
                                        onDragOver={(e) => handleDrag(e, q.id, true)}
                                        onDragLeave={(e) => handleDrag(e, q.id, false)}
                                        onDrop={(e) => handleDrop(e, q.id)}
                                        style={{ marginBottom: 'var(--space-md)' }}
                                    >
                                        <div className="upload-icon"><HiOutlineUpload /></div>
                                        <div className="upload-text">
                                            Drag & drop your answer sheet or <strong>click to browse</strong>
                                        </div>
                                        <input
                                            type="file"
                                            ref={(el) => fileRefs.current[q.id] = el}
                                            hidden
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                    </div>
                                    <motion.button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => handleSubmit(q.id)}
                                        disabled={submitting[q.id]}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <HiOutlineUpload /> {submitting[q.id] ? 'Uploading...' : 'Submit Answer'}
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
