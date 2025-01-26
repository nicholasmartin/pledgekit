-- Create pledge_status enum type
CREATE TYPE pledge_status AS ENUM ('pending', 'completed', 'cancelled', 'failed');

-- Create pledges table
CREATE TABLE public.pledges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    pledge_option_id uuid NOT NULL REFERENCES public.pledge_options(id) ON DELETE CASCADE,
    amount numeric NOT NULL CHECK (amount > 0),
    status pledge_status NOT NULL DEFAULT 'pending'::pledge_status,
    payment_intent_id text,
    payment_method_id text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common queries
CREATE INDEX pledges_user_id_idx ON public.pledges(user_id);
CREATE INDEX pledges_project_id_idx ON public.pledges(project_id);
CREATE INDEX pledges_status_idx ON public.pledges(status);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.pledges
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own pledges
CREATE POLICY "Users can view own pledges"
    ON public.pledges
    FOR SELECT
    USING (auth.uid() = user_id);

-- Project company members can view all pledges for their projects
CREATE POLICY "Company members can view project pledges"
    ON public.pledges
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.company_members cm
            JOIN public.projects p ON p.company_id = cm.company_id
            WHERE p.id = project_id
            AND cm.user_id = auth.uid()
        )
    );

-- Users can create their own pledges
CREATE POLICY "Users can create own pledges"
    ON public.pledges
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own pending pledges
CREATE POLICY "Users can update own pending pledges"
    ON public.pledges
    FOR UPDATE
    USING (
        auth.uid() = user_id 
        AND status = 'pending'::pledge_status
    )
    WITH CHECK (
        auth.uid() = user_id 
        AND status = 'pending'::pledge_status
    );

-- Create function to update project amount_pledged
CREATE OR REPLACE FUNCTION public.update_project_amount_pledged()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed'::pledge_status THEN
        UPDATE public.projects
        SET amount_pledged = amount_pledged + NEW.amount
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'completed'::pledge_status AND NEW.status = 'completed'::pledge_status THEN
            UPDATE public.projects
            SET amount_pledged = amount_pledged + NEW.amount
            WHERE id = NEW.project_id;
        ELSIF OLD.status = 'completed'::pledge_status AND NEW.status != 'completed'::pledge_status THEN
            UPDATE public.projects
            SET amount_pledged = amount_pledged - OLD.amount
            WHERE id = NEW.project_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating project amount_pledged
CREATE TRIGGER update_project_amount_pledged
    AFTER INSERT OR UPDATE ON public.pledges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_amount_pledged();
