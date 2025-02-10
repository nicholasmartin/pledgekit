-- Add is_private column to projects table
alter table projects 
add column is_private boolean not null default false;

-- Set existing projects to public (is_private = false)
update projects 
set is_private = false 
where is_private is null;

-- Drop existing function first
drop function if exists get_user_accessible_projects(uuid);

-- Update the get_user_accessible_projects function to handle private projects
create function get_user_accessible_projects(user_id uuid)
returns setof projects
language sql
security definer
set search_path = public
as $$
  select distinct p.*
  from projects p
  where 
    -- Public projects are always accessible
    (not p.is_private)
    or
    -- Private projects are accessible if user is approved
    (
      exists (
        select 1
        from user_invites ui
        where ui.company_id = p.company_id
        and ui.status = 'accepted'
        and ui.email = (
          select email
          from auth.users
          where id = user_id
        )
      )
    )
    or
    -- Company members can always access their own projects
    (
      exists (
        select 1
        from company_members cm
        where cm.company_id = p.company_id
        and cm.user_id = user_id
      )
    );
$$;

-- Update project RLS policies to handle private projects
drop policy if exists "Users can view projects" on projects;
create policy "Users can view projects"
  on projects
  for select
  using (
    -- Public projects are visible to all
    (not is_private)
    or
    -- Private projects are visible to approved users
    (
      exists (
        select 1
        from user_invites ui
        where ui.company_id = projects.company_id
        and ui.status = 'accepted'
        and ui.email = (
          select email
          from auth.users
          where id = auth.uid()
        )
      )
    )
    or
    -- Company members can always see their own projects
    (
      exists (
        select 1
        from company_members cm
        where cm.company_id = projects.company_id
        and cm.user_id = auth.uid()
      )
    )
  );
