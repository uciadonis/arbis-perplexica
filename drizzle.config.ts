import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: '192.168.68.106',
    port: 31000,
    user: 'plaixa',
    password: 'plaixa25@!',
    database: 'arbisus',
    ssl: false,
  },
} satisfies Config;
