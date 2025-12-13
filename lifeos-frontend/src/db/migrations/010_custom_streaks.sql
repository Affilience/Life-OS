-- Migration: Custom Streaks
-- Description: Add tables for user-created custom habit streaks

-- Custom streaks table
CREATE TABLE IF NOT EXISTS public.custom_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '⭐',
    color TEXT DEFAULT 'purple',
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
    custom_days INTEGER[] DEFAULT NULL, -- Array of day numbers (0=Sunday, 1=Monday, etc.)
    goal INTEGER DEFAULT NULL, -- Target streak goal (e.g., 30 days)
    description TEXT DEFAULT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    last_completed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom streak completions table
CREATE TABLE IF NOT EXISTS public.custom_streak_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_id UUID NOT NULL REFERENCES public.custom_streaks(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT DEFAULT NULL,

    -- Unique constraint: one completion per streak per day
    UNIQUE(streak_id, completed_date)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_custom_streaks_user_id ON public.custom_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_streak_completions_user_id ON public.custom_streak_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_streak_completions_streak_id ON public.custom_streak_completions(streak_id);
CREATE INDEX IF NOT EXISTS idx_custom_streak_completions_date ON public.custom_streak_completions(completed_date);

-- Enable Row Level Security
ALTER TABLE public.custom_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_streak_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_streaks
CREATE POLICY "Users can view own custom streaks"
    ON public.custom_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom streaks"
    ON public.custom_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom streaks"
    ON public.custom_streaks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom streaks"
    ON public.custom_streaks FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for custom_streak_completions
CREATE POLICY "Users can view own completions"
    ON public.custom_streak_completions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
    ON public.custom_streak_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
    ON public.custom_streak_completions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
    ON public.custom_streak_completions FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update streak stats when completion is added
CREATE OR REPLACE FUNCTION update_streak_stats()
RETURNS TRIGGER AS $$
DECLARE
    streak_record RECORD;
    consecutive_count INTEGER := 0;
    check_date DATE;
    found_completion BOOLEAN;
BEGIN
    -- Get the streak
    SELECT * INTO streak_record FROM public.custom_streaks WHERE id = NEW.streak_id;

    IF streak_record IS NULL THEN
        RETURN NEW;
    END IF;

    -- Calculate current streak starting from today going backwards
    check_date := CURRENT_DATE;

    LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.custom_streak_completions
            WHERE streak_id = NEW.streak_id AND completed_date = check_date
        ) INTO found_completion;

        IF found_completion THEN
            consecutive_count := consecutive_count + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            -- Check if yesterday was completed (allow continuing streak)
            IF consecutive_count = 0 AND check_date = CURRENT_DATE THEN
                check_date := check_date - INTERVAL '1 day';
                SELECT EXISTS(
                    SELECT 1 FROM public.custom_streak_completions
                    WHERE streak_id = NEW.streak_id AND completed_date = check_date
                ) INTO found_completion;

                IF found_completion THEN
                    consecutive_count := consecutive_count + 1;
                    check_date := check_date - INTERVAL '1 day';
                    CONTINUE;
                END IF;
            END IF;
            EXIT;
        END IF;
    END LOOP;

    -- Update the streak stats
    UPDATE public.custom_streaks
    SET
        current_streak = consecutive_count,
        longest_streak = GREATEST(longest_streak, consecutive_count),
        total_completions = total_completions + 1,
        last_completed_at = NEW.completed_at,
        updated_at = NOW()
    WHERE id = NEW.streak_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak stats on completion
DROP TRIGGER IF EXISTS trigger_update_streak_stats ON public.custom_streak_completions;
CREATE TRIGGER trigger_update_streak_stats
    AFTER INSERT ON public.custom_streak_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_streak_stats();

-- Function to recalculate streak on deletion
CREATE OR REPLACE FUNCTION recalculate_streak_on_delete()
RETURNS TRIGGER AS $$
DECLARE
    streak_record RECORD;
    consecutive_count INTEGER := 0;
    check_date DATE;
    found_completion BOOLEAN;
    total_count INTEGER;
BEGIN
    -- Get the streak
    SELECT * INTO streak_record FROM public.custom_streaks WHERE id = OLD.streak_id;

    IF streak_record IS NULL THEN
        RETURN OLD;
    END IF;

    -- Count total completions
    SELECT COUNT(*) INTO total_count FROM public.custom_streak_completions WHERE streak_id = OLD.streak_id;

    -- Calculate current streak starting from today going backwards
    check_date := CURRENT_DATE;

    LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.custom_streak_completions
            WHERE streak_id = OLD.streak_id AND completed_date = check_date
        ) INTO found_completion;

        IF found_completion THEN
            consecutive_count := consecutive_count + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            IF consecutive_count = 0 AND check_date = CURRENT_DATE THEN
                check_date := check_date - INTERVAL '1 day';
                SELECT EXISTS(
                    SELECT 1 FROM public.custom_streak_completions
                    WHERE streak_id = OLD.streak_id AND completed_date = check_date
                ) INTO found_completion;

                IF found_completion THEN
                    consecutive_count := consecutive_count + 1;
                    check_date := check_date - INTERVAL '1 day';
                    CONTINUE;
                END IF;
            END IF;
            EXIT;
        END IF;
    END LOOP;

    -- Update the streak stats
    UPDATE public.custom_streaks
    SET
        current_streak = consecutive_count,
        total_completions = total_count,
        updated_at = NOW()
    WHERE id = OLD.streak_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate streak on deletion
DROP TRIGGER IF EXISTS trigger_recalculate_streak ON public.custom_streak_completions;
CREATE TRIGGER trigger_recalculate_streak
    AFTER DELETE ON public.custom_streak_completions
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_streak_on_delete();

-- Grant permissions
GRANT ALL ON public.custom_streaks TO authenticated;
GRANT ALL ON public.custom_streak_completions TO authenticated;
