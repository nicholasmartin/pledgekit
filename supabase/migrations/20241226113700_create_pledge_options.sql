-- Create pledge_options table
create table public.pledge_options (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id) on delete cascade,
    title text not null,
    description text,
    amount numeric not null,
    benefits jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up RLS
alter table public.pledge_options enable row level security;

-- Policies for pledge_options
create policy "Anyone can view pledge options"
    on public.pledge_options
    for select
    using (true);

create policy "Company members can insert pledge options"
    on public.pledge_options
    for insert
    with check (
        exists (
            select 1
            from public.company_members cm
            join public.projects p on p.company_id = cm.company_id
            where p.id = project_id
            and cm.user_id = auth.uid()
        )
    );

create policy "Company members can update pledge options"
    on public.pledge_options
    for update
    using (
        exists (
            select 1
            from public.company_members cm
            join public.projects p on p.company_id = cm.company_id
            where p.id = project_id
            and cm.user_id = auth.uid()
        )
    );

create policy "Company members can delete pledge options"
    on public.pledge_options
    for delete
    using (
        exists (
            select 1
            from public.company_members cm
            join public.projects p on p.company_id = cm.company_id
            where p.id = project_id
            and cm.user_id = auth.uid()
        )
    );
