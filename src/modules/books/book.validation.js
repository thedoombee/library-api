const { z } = require("zod");

const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300),
    isbn: z.string().min(10).max(20),
    publishedYear: z.coerce.number().int().min(1000).max(new Date().getFullYear()),
    totalCopies: z.coerce.number().int().min(1).default(1),
    authorIds: z.array(z.string().uuid()).min(1, 'At least one author is required'),
  }).strict(),
});

const listBooksSchema = z
  .object({
    query: z.object({
      search: z.string().max(200).optional(),
      cursor: z.string().uuid().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
    body: z.object({
        search: z.string().max(200).optional(),
        cursor: z.string().uuid().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      })
      .optional(),
    params: z
      .object({
        search: z.string().max(200).optional(),
        cursor: z.string().uuid().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      })
      .optional(),
  })
  .strict();

module.exports = { createBookSchema, listBooksSchema };
