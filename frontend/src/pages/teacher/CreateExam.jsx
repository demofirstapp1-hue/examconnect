import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineClipboardList, HiOutlineCalendar, HiOutlineClock, HiOutlinePlus, HiOutlineUpload, HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi'

export default function CreateExam() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [students, setStudents] = useState([])
    const [selectedStudents, setSelectedStudents] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [examId, setExamId] = useState(null)

    const [examForm, setExamForm] = useState({
        title: '', description: '', scheduled_start: '', scheduled_end: '',
        duration_minutes: 60, status: 'scheduled'
    })

    const [questions, setQuestions] = useState([])
    const [currentQ, setCurrentQ] = useState({ question_text: '', marks: 10 })
    const fileRef = useRef()

    useEffect(() => {
        api.get('/teacher/students').then(({ data }) => setStudents(data)).catch(console.error)
    }, [])

    const handleCreateExam = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const { data } = await api.post('/teacher/exams', {
                ...examForm,
                student_ids: selectedStudents,
            })
            setExamId(data.id)
            toast.success('Exam created!')
            setStep(3)
        } catch (err) {
            toast.error('Failed to create exam')
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddQuestion = async (e) => {
        e.preventDefault()
        if (!examId) return
        const formData = new FormData()
        formData.append('question_text', currentQ.question_text)
        formData.append('marks', currentQ.marks)
        formData.append('order_index', questions.length)
        if (fileRef.current?.files[0]) {
            formData.append('question_file', fileRef.current.files[0])
        }
        try {
            const { data } = await api.post(`/teacher/exams/${examId}/questions`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setQuestions([...questions, data])
            setCurrentQ({ question_text: '', marks: 10 })
            if (fileRef.current) fileRef.current.value = ''
            toast.success('Question added!')
        } catch (err) {
            toast.error('Failed to add question')
        }
    }

    const toggleStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const stepIndicator = (num, label) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 700,
                background: step >= num ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                color: step >= num ? 'white' : 'var(--text-muted)',
            }}>{num}</div>
            <span style={{ fontSize: '0.875rem', fontWeight: step === num ? 600 : 400, color: step === num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
        </div>
    )

    return (
        <DashboardLayout title="Create Exam" subtitle="Set up a new exam in three easy steps">
            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)', alignItems: 'center' }}>
                {stepIndicator(1, 'Exam Details')}
                <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
                {stepIndicator(2, 'Assign Students')}
                <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
                {stepIndicator(3, 'Add Questions')}
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Exam Details */}
                {step === 1 && (
                    <motion.div key="step1" className="glass-card" style={{ padding: 'var(--space-xl)', maxWidth: 640 }}
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}><HiOutlineClipboardList style={{ verticalAlign: -3 }} /> Exam Details</h3>
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input className="form-input" required value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} placeholder="e.g. Midterm Mathematics" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-textarea" value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} placeholder="Exam instructions and details..." />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Start Date & Time</label>
                                <input className="form-input" type="datetime-local" value={examForm.scheduled_start} onChange={(e) => setExamForm({ ...examForm, scheduled_start: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date & Time</label>
                                <input className="form-input" type="datetime-local" value={examForm.scheduled_end} onChange={(e) => setExamForm({ ...examForm, scheduled_end: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duration (minutes)</label>
                            <input className="form-input" type="number" min={5} value={examForm.duration_minutes} onChange={(e) => setExamForm({ ...examForm, duration_minutes: parseInt(e.target.value) })} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                            <button className="btn btn-primary" onClick={() => examForm.title ? setStep(2) : toast.error('Title is required')}>
                                Next: Assign Students →
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Assign Students */}
                {step === 2 && (
                    <motion.div key="step2" className="glass-card" style={{ padding: 'var(--space-xl)', maxWidth: 640 }}
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}><HiOutlineUsers style={{ verticalAlign: -3 }} /> Assign Students</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                            Select students to assign to this exam ({selectedStudents.length} selected)
                        </p>
                        {students.length === 0 ? (
                            <div className="empty-state"><p>No students available. Add students first.</p></div>
                        ) : (
                            <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {students.map(s => (
                                    <div key={s.id}
                                        onClick={() => toggleStudent(s.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                            background: selectedStudents.includes(s.id) ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${selectedStudents.includes(s.id) ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                                            transition: 'all 0.15s ease',
                                        }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            border: `2px solid ${selectedStudents.includes(s.id) ? 'var(--accent-purple)' : 'var(--text-muted)'}`,
                                            background: selectedStudents.includes(s.id) ? 'var(--accent-purple)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12,
                                        }}>
                                            {selectedStudents.includes(s.id) && '✓'}
                                        </div>
                                        <div className="avatar avatar-sm">{s.name?.charAt(0)?.toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-lg)' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary" onClick={handleCreateExam} disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Exam & Add Questions →'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Add Questions */}
                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                        <div className="glass-card" style={{ padding: 'var(--space-xl)', maxWidth: 640, marginBottom: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}><HiOutlinePlus style={{ verticalAlign: -3 }} /> Add Question</h3>
                            <form onSubmit={handleAddQuestion}>
                                <div className="form-group">
                                    <label className="form-label">Question Text</label>
                                    <textarea className="form-textarea" value={currentQ.question_text} onChange={(e) => setCurrentQ({ ...currentQ, question_text: e.target.value })} placeholder="Type the question here..." required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Marks</label>
                                    <input className="form-input" type="number" min={1} value={currentQ.marks} onChange={(e) => setCurrentQ({ ...currentQ, marks: parseInt(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Question File (optional)</label>
                                    <div className="file-upload-zone" onClick={() => fileRef.current?.click()}>
                                        <div className="upload-icon"><HiOutlineUpload /></div>
                                        <div className="upload-text">Click to upload or <strong>drag & drop</strong></div>
                                        <input type="file" ref={fileRef} hidden />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    <HiOutlinePlus /> Add Question
                                </button>
                            </form>
                        </div>

                        {questions.length > 0 && (
                            <div className="glass-card" style={{ padding: 'var(--space-xl)', maxWidth: 640 }}>
                                <h4 style={{ marginBottom: 'var(--space-md)' }}>Added Questions ({questions.length})</h4>
                                {questions.map((q, i) => (
                                    <div key={q.id || i} style={{
                                        padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(255,255,255,0.03)', marginBottom: 8,
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>Q{i + 1}. {q.question_text?.substring(0, 60)}{q.question_text?.length > 60 ? '...' : ''}</span>
                                            <span className="badge badge-purple">{q.marks} marks</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: 'var(--space-lg)', maxWidth: 640 }}>
                            <button className="btn btn-success btn-lg" style={{ width: '100%' }} onClick={() => { toast.success('Exam setup complete!'); navigate('/teacher') }}>
                                ✓ Finish & Go to Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
