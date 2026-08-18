import {z} from 'zod';

const createBookSchema = z.object({
    body: z.object({
        title = z.string().min(3, "The title must contains at least 3 caracters").max(200),
        isbn = z.string().min(20).max(20),
        publishedYear = z.coerce.number().int().min(1000).max(new Date().getFullYear()),
        totalCopies = z.coerce.number().int().min(1).default(1),
        authorIds = z.array(z.string().uuid()).min(1, 'You must add at least one author'),
    })
}).strict();

const listBooksSchema = z.object({
    query: z.object({
        search = z.string.max(200).optional(),
        cursor = z.string().uuid().optional(),
        limit = z.coerce.number().int().min(1).max(100).default(20),
    }),
}).strict();

module.exports = { createBookSchema, listBooksSchema};