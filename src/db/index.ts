import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  'postgresql://plaixa:plaixa25%40%21@192.168.68.106:31000/arbisus';

const client = postgres(connectionString);
const db = drizzle(client, {
  schema: schema,
});

export default db;
