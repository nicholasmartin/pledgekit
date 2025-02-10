-- Create user_invites table for managing company user invitations
create type user_invite_status as enum ('pending', 'accepted');

create table user_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  email text not null,
  first_name text,
  last_name text,
  invited_at timestamptz not null default now(),
  status user_invite_status not null default 'pending',
  unique(company_id, email)
);

-- Add RLS policies for user_invites table
alter table user_invites enable row level security;

-- Allow company admins to manage invites for their company
create policy "Company admins can manage invites"
  on user_invites
  for all
  using (
    exists (
      select 1 
      from company_members 
      where company_id = user_invites.company_id 
      and user_id = auth.uid() 
      and role = 'admin'
    )
  );

-- Allow users to view their own invites
create policy "Users can view their own invites"
  on user_invites
  for select
  using (
    email = (
      select email 
      from auth.users 
      where id = auth.uid()
    )
  );

-- Create function to check if a user is approved for a company
create or replace function is_user_approved_for_company(company_id uuid, user_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_invites
    where company_id = $1
    and email = $2
    and status = 'accepted'
  );
$$;
