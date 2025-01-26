-- First, remove any company_members records with null company_id (there shouldn't be any based on business logic)
DELETE FROM company_members WHERE company_id IS NULL;

-- Then make the column NOT NULL
ALTER TABLE company_members 
  ALTER COLUMN company_id SET NOT NULL;

-- Update the foreign key constraint to ensure referential integrity
ALTER TABLE company_members
  DROP CONSTRAINT IF EXISTS company_members_company_id_fkey,
  ADD CONSTRAINT company_members_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES companies(id) 
    ON DELETE CASCADE;
