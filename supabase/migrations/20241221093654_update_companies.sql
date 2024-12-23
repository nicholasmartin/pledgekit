-- Add new fields to companies table
alter table public.companies
add column if not exists email text,
add column if not exists website_url text,
add column if not exists onboarding_completed boolean default false;

-- Update create_company_with_owner procedure to include new fields
create or replace procedure create_company_with_owner(
    user_id uuid,
    company_name text,
    owner_first_name text,
    owner_last_name text,
    company_email text,
    company_website text default null
)
language plpgsql
as $$
declare
    new_company_id uuid;
begin
    -- Create company record with new fields
    insert into public.companies (name, slug, email, website_url, onboarding_completed)
    values (
        company_name,
        generate_company_slug(company_name),
        company_email,
        company_website,
        false
    )
    returning id into new_company_id;

    -- Create company member record for owner
    insert into public.company_members (company_id, user_id, role)
    values (new_company_id, user_id, 'owner');

    -- Create user profile with first and last name
    insert into public.user_profiles (id, first_name, last_name, display_name)
    values (user_id, owner_first_name, owner_last_name, owner_first_name || ' ' || owner_last_name)
    on conflict (id) do update
    set 
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        display_name = excluded.first_name || ' ' || excluded.last_name;
end;
$$;
