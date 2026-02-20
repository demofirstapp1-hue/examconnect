import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user)
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user)
                fetchProfile(session.user.id)
            } else {
                setUser(null)
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (err) {
            console.error('Error fetching profile:', err)
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password, name, role) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name, role }
                }
            })
            if (error) throw error
            toast.success('Account created! Please check your email to verify.')
            return data
        } catch (err) {
            toast.error(err.message)
            throw err
        }
    }

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            toast.success('Welcome back!')
            return data
        } catch (err) {
            toast.error(err.message)
            throw err
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        toast.success('Signed out')
    }

    const getToken = async () => {
        const { data } = await supabase.auth.getSession()
        return data?.session?.access_token || ''
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        getToken,
        isAdmin: profile?.role === 'admin',
        isTeacher: profile?.role === 'teacher',
        isStudent: profile?.role === 'student',
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
