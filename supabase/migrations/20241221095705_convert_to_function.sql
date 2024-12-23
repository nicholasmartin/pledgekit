-- Drop all versions of the procedure (from previous migrations)
drop procedure if exists create_company_with_owner(uuid, text, text);
drop procedure if exists create_company_with_owner(uuid, text, text, text);
drop procedure if exists create_company_with_owner(uuid, text, text, text, text, text);

-- Create the new function version
create or replace function create_company_with_owner(
    user_id uuid,
    company_name text,
    owner_first_name text,
    owner_last_name text,
    company_email text,
    company_website text default null
) returns json
language plpgsql
security definer
as $$
declare
    new_company_id uuid;
    company_record record;
begin
    -- Create company record with new fields
    insert into public.companies (
        name,
        slug,
        email,
        website_url,
        onboarding_completed
    )
    values (
        company_name,
        generate_company_slug(company_name),
        company_email,
        company_website,
        false
    )
    returning * into company_record;

    new_company_id := company_record.id;

    -- Create company member record for owner
    insert into public.company_members (company_id, user_id, role)
    values (new_company_id, user_id, 'owner');

    -- Create user profile with first and last name
    insert into public.user_profiles (id, first_name, last_name, display_name)
    values (
        user_id,
        owner_first_name,
        owner_last_name,
        owner_first_name || ' ' || owner_last_name
    )
    on conflict (id) do update
    set 
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        display_name = excluded.first_name || ' ' || excluded.last_name;

    -- Return the created company details
    return json_build_object(
        'company_id', new_company_id,
        'company_name', company_record.name,
        'company_slug', company_record.slug,
        'company_email', company_record.email,
        'company_website', company_record.website_url,
        'created_at', company_record.created_at
    );
end;
$$;
