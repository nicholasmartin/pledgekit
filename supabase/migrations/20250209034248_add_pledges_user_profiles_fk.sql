-- First ensure all users have user_profile entries
INSERT INTO public.user_profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles);

-- Add foreign key from pledges to user_profiles
ALTER TABLE public.pledges
ADD CONSTRAINT pledges_user_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES public.user_profiles(id)
ON DELETE CASCADE;

-- Add index for the foreign key
CREATE INDEX IF NOT EXISTS pledges_user_profiles_idx
ON public.pledges(user_id);