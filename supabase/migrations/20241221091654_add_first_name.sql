-- Add first_name to user_profiles
alter table public.user_profiles
add column first_name text;

-- Update create_company_with_owner procedure to include both first and last name
create or replace procedure create_company_with_owner(
    user_id uuid,
    company_name text,
    owner_first_name text,
    owner_last_name text
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
