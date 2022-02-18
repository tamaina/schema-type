# Schema Type
Get TypeScript Type from [JSON Schema](https://json-schema.org/) like object!

## Source
Everything is in a single file: [index.ts](index.ts)

## Usage
See and test [playground.ts](test/playground.ts)

### Example
```typescript
import { SchemaType, Packed } from 'schema-type';

const defs = {
    User: {
        type: 'object',
        required: ['id', 'username', 'description'],
        properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            description: { type: 'string', nullable: true },
        }
    },
    Post: {
        type: 'object',
        required: ['id', 'userId', 'user', 'title', 'contens', 'state'],
        properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            user: { type: 'object', ref: 'User' },
            title: { type: 'string', nullable: true },
            contens: { type: 'string' },
            state: { type: 'string', enum: ['published', 'draft'] },
        }
    },
    PostOrUser: {
        oneOf: [
            { type: 'object', ref: 'Post' },
            { type: 'object', ref: 'User' },
        ]
    }
} as const;

// Get the type of `Post` entity
type Post = Packed<typeof defs, 'Post'>; 

// Define like schema
const likeDef = {
    type: 'object',
    required: ['id', 'userId', 'user', 'postId', 'post'],
    properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        user: { type: 'object', ref: 'User' },
        postId: { type: 'string' },
        post: { type: 'object', ref: 'Post' },
    }
} as const;

// Get like entity type
type Like = SchemaType<typeof defs, typeof likeDef>
```

### `SchemaType<Ctx, Schema>`
Just get the type from JSON Schema like object.

#### `Ctx`
You should `Ctx`, implementation of following type named `Defs`, the list of [defs](https://json-schema.org/understanding-json-schema/structuring.html#defs):

```typescript
export type Defs = { [x: string]: { type: 'object'; properties: Obj<Defs>; } | { oneOf?: Schema<Defs>[]; } | { allOf?: Schema<Defs>[]; }; };
```

If you don have no def, write `{}` (empty object). 

### `Packed<Ctx, keyof Ctx>`
Look up the def type with its name.

(The origin of this type name is a remnant from when it was used in Misskey.)
