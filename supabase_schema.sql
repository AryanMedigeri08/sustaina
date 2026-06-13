-- ═══════════════════════════════════════════
-- SUSTAINA — Supabase PostgreSQL Schema Setup
-- ═══════════════════════════════════════════
-- INSTRUCTIONS: Copy and paste this entire script into the SQL Editor 
-- in your Supabase Dashboard (https://supabase.com) and click "Run".

-- 1. Create Households table
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    city TEXT,
    state TEXT,
    household_size INTEGER,
    home_type TEXT,
    diet TEXT,
    primary_transport TEXT,
    daily_transport_km NUMERIC,
    electricity_units NUMERIC,
    lpg_cylinders NUMERIC,
    sustainability_goals TEXT[] DEFAULT '{}'::text[] NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    xp_next INTEGER DEFAULT 2000 NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    level_name TEXT DEFAULT 'Just Starting'::text,
    household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    detail TEXT,
    co2 NUMERIC NOT NULL,
    cost NUMERIC DEFAULT 0 NOT NULL,
    icon TEXT,
    time TEXT,
    date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- 4. Create Goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    progress INTEGER DEFAULT 0 NOT NULL,
    target_date TEXT,
    color TEXT,
    bg_color TEXT,
    is_shared BOOLEAN DEFAULT false NOT NULL
);

-- 5. Create Memory table
CREATE TABLE IF NOT EXISTS public.memory (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_preferences JSONB DEFAULT '{}'::jsonb NOT NULL,
    behavior_patterns JSONB DEFAULT '{}'::jsonb NOT NULL,
    recommendation_success JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- 6. Create Simulation History table
CREATE TABLE IF NOT EXISTS public.simulation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    transport_reduce_pct NUMERIC DEFAULT 0,
    eco_transit BOOLEAN DEFAULT false,
    diet_val TEXT,
    elec_reduce_pct NUMERIC DEFAULT 0,
    solar BOOLEAN DEFAULT false,
    co2_reduction NUMERIC NOT NULL,
    money_saved NUMERIC NOT NULL,
    trees_saved INTEGER NOT NULL,
    improvement_pct INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Purchase Advisor History table
CREATE TABLE IF NOT EXISTS public.purchase_advisor_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    cost NUMERIC NOT NULL,
    running_cost NUMERIC NOT NULL,
    energy_usage NUMERIC NOT NULL,
    expected_lifetime NUMERIC NOT NULL,
    recommendation TEXT NOT NULL,
    explanation TEXT NOT NULL,
    annual_savings NUMERIC NOT NULL,
    carbon_reduction NUMERIC NOT NULL,
    payback_period NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    period TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Timeline table
CREATE TABLE IF NOT EXISTS public.timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_advisor_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;

-- Create Policies to secure data access (Only owner can read/write their own records)

-- Profiles
CREATE POLICY "Manage own profile" ON public.profiles 
    FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Activities
CREATE POLICY "Manage own activities" ON public.activities 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals
CREATE POLICY "Manage own goals" ON public.goals 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Memory
CREATE POLICY "Manage own memory" ON public.memory 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Simulation History
CREATE POLICY "Manage own simulations" ON public.simulation_history 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Purchase Advisor
CREATE POLICY "Manage own purchase advice" ON public.purchase_advisor_history 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reports
CREATE POLICY "Manage own reports" ON public.reports 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Manage own notifications" ON public.notifications 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Timeline
CREATE POLICY "Manage own timeline events" ON public.timeline 
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Households (Members of a household can view/manage the household details)
CREATE POLICY "Manage own household" ON public.households 
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.household_id = households.id
        )
    );
