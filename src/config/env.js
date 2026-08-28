const {z} = require('zod');
require('dotenv').config();

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 caracters '),
    PORT: z.coerce.number(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    TOKEN_EXPIRATION: z.string().trim().regex(
      /^\d+(?:\.\d+)?\s*(?:ms|s|m|h|d|w|y)?$/,
      'TOKEN_EXPIRATION must be a duration such as "1h" or "20m"'
    ),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(' Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;