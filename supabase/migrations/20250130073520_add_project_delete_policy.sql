-- Add DELETE policy for projects table
CREATE POLICY "Enable delete for company members" ON public.projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = projects.company_id
            AND c.id IN (
                SELECT company_id FROM public.company_members
                WHERE user_id = auth.uid()
            )
        )
    );