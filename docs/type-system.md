# Type System Architecture

## Overview

The type system in PledgeKit follows a layered architecture to ensure type safety between the database and domain layers:

1. **Database Schema** (`/supabase/migrations/*.sql`)
   - Source of truth for database structure
   - Defines tables, columns, and relationships

2. **Domain Types** (`/frontend/src/types/domain/**/types.ts`)
   - Business domain models
   - Derived from Zod schemas
   - Example: `CannyPost`, `User`, `Project`

3. **Domain Schemas** (`/frontend/src/types/domain/**/schema.ts`)
   - Zod schemas that define validation rules
   - Generate TypeScript types automatically
   - Example: `cannyPostSchema`, `userSchema`

4. **Type Transformers** (`/frontend/src/types/transformers/*.ts`)
   - Bridge between database and domain types
   - Functions like `toCannyPost()` and `toDbCannyPost()`

## Best Practices

### When Making Database Changes

1. Create a new migration in `/supabase/migrations/`
2. Update corresponding domain schema in `domain/**/schema.ts`
3. Update transformer functions in `transformers/*.ts`
4. Run TypeScript compiler to catch type mismatches

### When Adding New Features

1. Define domain types first in `domain/**/types.ts`
2. Create corresponding Zod schema in `domain/**/schema.ts`
3. Add transformer functions if database persistence is needed
4. Update database schema if new fields are required

### Type Safety Checklist

- [ ] Database columns match transformer function types
- [ ] Domain types are derived from Zod schemas using `z.infer`
- [ ] Transformer functions handle all required fields
- [ ] TypeScript compiler shows no errors
- [ ] Zod validation covers all edge cases

## Common Patterns

### Domain Type Definition
```typescript
import { z } from 'zod'
import { myEntitySchema } from './schema'

export type MyEntity = z.infer<typeof myEntitySchema>
```

### Database to Domain Transformation
```typescript
export function toMyEntity(dbEntity: Tables<'table_name'>): MyEntity {
  return myEntitySchema.parse({
    // map database fields to domain fields
  })
}
```

### Domain to Database Transformation
```typescript
export function toDbMyEntity(entity: MyEntity): Omit<Tables<'table_name'>, 'id' | 'created_at'> {
  return {
    // map domain fields to database fields
  }
}
```

## Type Dependencies Graph

```
Database Schema (SQL)
       ↓
Domain Schema (Zod)
       ↓
Domain Types (TypeScript)
       ↕
Type Transformers
```

## Tips

1. Use TypeScript's strict mode to catch type mismatches early
2. Leverage Zod's validation for runtime type safety
3. Keep transformers simple and focused
4. Document any special type handling or edge cases
5. Use TypeScript compiler as first line of defense
