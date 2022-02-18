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
