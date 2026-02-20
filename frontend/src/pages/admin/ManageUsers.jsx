import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import { HiOutlineSearch, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi'

export default function ManageUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [editingUser, setEditingUser] = useState(null)
    const [newRole, setNewRole] = useState('')

    useEffect(() => { fetchUsers() }, [roleFilter])

    const fetchUsers = async () => {
        try {
            const params = roleFilter ? `?role=${roleFilter}` : ''
            const { data } = await api.get(`/admin/users${params}`)
            setUsers(data)
        } catch (err) {
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateRole = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole })
            toast.success('Role updated')
            setEditingUser(null)
            fetchUsers()
        } catch (err) {
            toast.error('Failed to update role')
        }
    }

    const handleDeleteUser = async (userId, name) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
        try {
            await api.delete(`/admin/users/${userId}`)
            toast.success('User deleted')
            fetchUsers()
        } catch (err) {
            toast.error('Failed to delete user')
        }
    }

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    const roleBadge = (role) => {
        const map = { admin: 'badge-purple', teacher: 'badge-blue', student: 'badge-teal' }
        return <span className={`badge ${map[role] || 'badge-purple'}`}>{role}</span>
    }

    return (
        <DashboardLayout title="Manage Users" subtitle="View, edit roles, and remove users from the platform">
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 240, marginBottom: 0 }}>
                    <HiOutlineSearch className="search-icon" />
                    <input
                        className="form-input"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: 160 }}>
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                </select>
            </div>

            <div className="glass-card" style={{ overflow: 'auto' }}>
                {loading ? (
                    <div style={{ padding: 'var(--space-xl)' }}>
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton skeleton-text" style={{ width: `${80 - i * 5}%`, marginBottom: 16 }} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h4>No users found</h4>
                        <p>Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            {editingUser === user.id ? (
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <select className="form-select" value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ width: 120, padding: '4px 8px', fontSize: '0.8125rem' }}>
                                                        <option value="admin">Admin</option>
                                                        <option value="teacher">Teacher</option>
                                                        <option value="student">Student</option>
                                                    </select>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleUpdateRole(user.id)}>Save</button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)}>Cancel</button>
                                                </div>
                                            ) : (
                                                roleBadge(user.role)
                                            )}
                                        </td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-secondary btn-icon" title="Change role" onClick={() => { setEditingUser(user.id); setNewRole(user.role) }}>
                                                    <HiOutlinePencil />
                                                </button>
                                                <button className="btn btn-danger btn-icon" title="Delete user" onClick={() => handleDeleteUser(user.id, user.name)}>
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    )
}
