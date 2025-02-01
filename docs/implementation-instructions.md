# Implementation Instructions

## 1. Project Page Layout
### Description
Update the project page layout to match the company header and width.

### Steps:
1. Open the file: `frontend/src/app/(public)/companies/[slug]/projects/[id]/page.tsx`
2. Modify the container to have a max-width and centered layout.

### Changes:
```typescript
- Add a `max-wdith: 1200px`
- Add `mx-auto` to center the container
- Add `px-4` to the container for proper spacing

## 2. Add Back to All Projects Link
### Description
Add a "Back to all Projects" link at the top of the page.

### Steps:
1. Add the following code at the top of the page, before the ProjectDetails component:
```typescript
<a href="/companies/[slug]/projects" className="text-blue-600 hover:text-blue-800">
  ← Back to All Projects
</a>
```

## 3. Modify the Container
### Description
Update the container styling to match the company header and width.

### Steps:
1. Update the container div with:
```typescript
<div className="container mx-auto max-w-[1200px] px-4">
```

## 4. Verify Changes
### Description
Ensure that the changes maintain the same styling as the company header and proper spacing.

### Steps:
1. Run the development server to test the changes
2. Navigate to a project page to verify the layout