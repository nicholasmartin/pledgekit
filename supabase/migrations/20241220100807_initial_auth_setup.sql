-- Create extension for UUID generation if not exists
create extension if not exists "uuid-ossp";

-- Companies table for organization profiles
create table public.companies (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    name text not null,
    slug text not null unique,
    description text,
    settings jsonb default '{}'::jsonb,
    -- Ensure valid slugs (only lowercase letters, numbers, and hyphens)
    constraint valid_slug check (slug ~* '^[a-z0-9-]+$')
);

-- Company members table for employee management
create table public.company_members (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid references public.companies(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    -- Ensure unique user per company
    unique(company_id, user_id)
);

-- User profiles for public users
create table public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    display_name text,
    settings jsonb default '{}'::jsonb
);

-- Function to generate a slug from company name
create or replace function generate_company_slug(company_name text)
returns text as $$
declare
    base_slug text;
    new_slug text;
    counter integer := 0;
begin
    -- Convert to lowercase, replace spaces and special chars with hyphens
    base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    -- Start with base slug
    new_slug := base_slug;
    
    -- Keep trying until we find a unique slug
    while exists(select 1 from companies where slug = new_slug) loop
        counter := counter + 1;
        new_slug := base_slug || '-' || counter::text;
    end loop;
    
    return new_slug;
end;
$$ language plpgsql;

-- Stored procedure to create company and assign owner
create or replace procedure create_company_with_owner(
    user_id uuid,
    company_name text,
    owner_name text
)
language plpgsql
as $$
declare
    new_company_id uuid;
begin
    -- Create company record
    insert into public.companies (name, slug)
    values (
        company_name,
        generate_company_slug(company_name)
    )
    returning id into new_company_id;

    -- Create company member record for owner
    insert into public.company_members (company_id, user_id, role)
    values (new_company_id, user_id, 'owner');

    -- Create user profile
    insert into public.user_profiles (id, display_name)
    values (user_id, owner_name)
    on conflict (id) do update
    set display_name = excluded.display_name;
end;
$$;
