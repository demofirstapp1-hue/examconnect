import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ulvydqpedchdoissdnxd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsdnlkcXBlZGNoZG9pc3NkbnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjgzNTgsImV4cCI6MjA4NzE0NDM1OH0.RuSWi9oDeJQ-9278a-RIac9fAhpKUyTA6CNBPSMZUjA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
