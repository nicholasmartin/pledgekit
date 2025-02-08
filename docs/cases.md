# Snake Case vs Camel Case Inconsistencies

## Identified Cases

### 1. ProjectPreview Component Mismatch
- **File:** frontend/src/app/(protected)/dashboard/company/projects/[id]/page.tsx
- **Lines:** 37-38
- **Issue:** The component expects pledge options with snake_case properties (project_id, created_at) but receives camelCase properties (projectId, createdAt)
- **Solution:** Update the component to use camelCase properties consistently

### 2. toPledgeOption Transformer Inconsistency
- **File:** frontend/src/types/transformers/pledge.ts
- **Lines:** 12-20
- **Issue:** Returns camelCase properties while some components expect snake_case
- **Solution:** Consider standardizing on camelCase throughout the frontend codebase

### 3. Database Response Mapping
- **File:** frontend/src/types/transformers/project.ts
- **Lines:** 99-117
- **Issue:** Mapping to camelCase properties from snake_case database columns
- **Solution:** Continue this practice but ensure consistency across all transformers

### 4. Pledge Options Transformer
- **File:** frontend/src/types/transformers/pledge.ts
- **Lines:** 12-20
- **Issue:** Uses camelCase return type while some components use snake_case
- **Solution:** Update components to use camelCase or adjust transformers to return snake_case

### 5. ProjectPreview Usage
- **File:** frontend/src/components/dashboard/projects/project-preview.tsx
- **Lines:** 11-22
- **Issue:** Expects snake_case properties in props
- **Solution:** Update props interface to use camelCase

## Recommendations
1. Standardize on using camelCase for all frontend code
2. Update components to use camelCase properties
3. Ensure all transformers return consistent property names
4. Review and update any interfaces or types that expect snake_case properties

By addressing these inconsistencies, we can eliminate type errors and improve code maintainability.