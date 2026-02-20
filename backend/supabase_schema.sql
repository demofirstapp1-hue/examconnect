-- Supabase SQL: Run this in the Supabase SQL Editor to create all tables

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam-Student assignments (many-to-many)
CREATE TABLE IF NOT EXISTS exam_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(exam_id, student_id)
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT DEFAULT '',
    question_file_url TEXT DEFAULT '',
    marks INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    answer_file_url TEXT DEFAULT '',
    answer_text TEXT DEFAULT '',
    obtained_marks INTEGER,
    feedback TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, student_id)
);

-- Results
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_marks INTEGER DEFAULT 0,
    obtained_marks INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- Enable Row Level Security (optional, since backend uses service role)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (policies for backend)
CREATE POLICY "Service role full access" ON profiles FOR ALL USING (true);
CREATE POLICY "Service role full access" ON exams FOR ALL USING (true);
CREATE POLICY "Service role full access" ON exam_students FOR ALL USING (true);
CREATE POLICY "Service role full access" ON questions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON answers FOR ALL USING (true);
CREATE POLICY "Service role full access" ON results FOR ALL USING (true);

-- Auto-create profile on user signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
