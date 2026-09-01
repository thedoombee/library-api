const { z } = require('zod');

const createLoanSchema = z.object({
  body: z.object({ bookId: z.string().uuid() }).strict(),
});

const listLoansSchema = z.object({
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

module.exports = { createLoanSchema, listLoansSchema };