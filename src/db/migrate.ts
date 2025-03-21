import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema'; // Importa tu esquema

async function main() {
  const DATABASE_URL =
    'postgresql://plaixa:plaixa25%40%21@192.168.68.106:31000/arbisus';

  try {
    console.log('Conectando a la base de datos...');
    const migrationClient = postgres(DATABASE_URL, { max: 1 });

    // Pasar el esquema a drizzle
    const db = drizzle(migrationClient, { schema });

    console.log('Conectado a la base de datos');

    console.log('Iniciando migración...');
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('Migración completada');

    await migrationClient.end();
    console.log('Conexión a la base de datos cerrada');

    process.exit(0);
  } catch (error) {
    console.error('La migración falló con el error:', error);
    process.exit(1);
  }
}

main();

// import { migrate } from 'drizzle-orm/postgres-js/migrator';
// import postgres from 'postgres';
// import { drizzle } from 'drizzle-orm/postgres-js';
// import * as schema from './schema';
// import * as fs from 'fs';
// import * as path from 'path';

// async function main() {
//   const DATABASE_URL =
//     'postgresql://plaixa:plaixa25%40%21@192.168.68.106:31000/arbisus';

//   try {
//     console.log('Initializing migration...');

//     // Check if migrations directory exists and list files
//     const migrationDir = './drizzle';
//     if (!fs.existsSync(migrationDir)) {
//       console.error('Migration directory does not exist!');
//       process.exit(1);
//     }

//     const files = fs.readdirSync(migrationDir);
//     console.log('Migration files found:', files);

//     // Test database connection with increased logging
//     console.log('Testing database connection...');
//     const pgClient = postgres(DATABASE_URL, {
//       max: 1,
//       debug: true, // Enable postgres.js debug logging
//       connect_timeout: 30, // Connection timeout in seconds
//     });

//     // Verify connection with a simple query
//     try {
//       console.log('Executing test query...');
//       const result =
//         await pgClient`SELECT current_database() as db, current_user as user`;
//       console.log('Connection test successful:', result);
//     } catch (error) {
//       console.error('Connection test query failed:', error);
//       process.exit(1);
//     }

//     console.log('Creating Drizzle instance');
//     const db = drizzle(pgClient, { schema });

//     console.log('Starting migration...');
//     // Wrap the migrate call in a promise with a timeout to detect hanging
//     await Promise.race([
//       migrate(db, { migrationsFolder: migrationDir }),
//       new Promise((_, reject) =>
//         setTimeout(
//           () => reject(new Error('Migration timed out after 30 seconds')),
//           10000,
//         ),
//       ),
//     ]);

//     console.log('Migration completed');
//     await pgClient.end();
//     console.log('Database connection closed');
//     process.exit(0);
//   } catch (error) {
//     console.error('Migration failed with error:', error);
//     process.exit(1);
//   }
// }

// main();

// async function runMigrationManually() {
//   const DATABASE_URL =
//     'postgresql://plaixa:plaixa25%40%21@192.168.68.106:31000/arbisus';
//   const pgClient = postgres(DATABASE_URL);
//   const sqlContent = fs.readFileSync(
//     './drizzle/0000_lame_thunderbolt.sql',
//     'utf8',
//   );

//   // Split the SQL file into individual statements (this is a simplified approach)
//   const statements = sqlContent
//     .split(';')
//     .filter((stmt) => stmt.trim().length > 0);

//   console.log(`Found ${statements.length} SQL statements to execute`);

//   for (let i = 0; i < statements.length; i++) {
//     const stmt = statements[i];
//     console.log(`Executing statement ${i + 1}/${statements.length}`);
//     try {
//       await pgClient.unsafe(stmt);
//       console.log(`Statement ${i + 1} executed successfully`);
//     } catch (error) {
//       console.error(`Error executing statement ${i + 1}:`, error);
//       throw error;
//     }
//   }

//   console.log('All SQL statements executed successfully');
//   await pgClient.end();
// }

// import { migrate } from 'drizzle-orm/postgres-js/migrator';
// import postgres from 'postgres';
// import { drizzle } from 'drizzle-orm/postgres-js';
// import * as schema from './schema';

// const DEBUG = true;

// async function main() {
//   const DATABASE_URL =
//     'postgresql://plaixa:plaixa25%40%21@192.168.68.106:31000/arbisus';

//   try {
//     console.log('Initializing migration...');
//     // const migrationClient = postgres(DATABASE_URL, { max: 1 });
//     const migrationClient = postgres(DATABASE_URL, {
//       max: 1,
//       idle_timeout: 10,
//       debug: true, // Add debug logging
//     });
//     const db = drizzle(migrationClient, { schema });

//     console.log('Connected to database');
//     console.log('Looking for migrations in ./drizzle');

//     // Check if migrations directory exists
//     const fs = require('fs');
//     if (!fs.existsSync('./drizzle')) {
//       console.error('Migration directory does not exist!');
//       process.exit(1);
//     } else {
//       console.log('Migration directory exists');
//     }

//     console.log('Starting migration...');
//     // await migrate(db, { migrationsFolder: './drizzle' });
//     await migrate(db, {
//       migrationsFolder: './drizzle',
//       // migrationsTable: 'drizzle_migrations',
//     });
//     console.log('Migration completed');
//     await migrationClient.end();
//     console.log('Database connection closed');
//     process.exit(0);
//   } catch (error) {
//     console.error('Migration failed with error:', error);
//     process.exit(1);
//   }
// }

// main();

// import { Pool } from 'pg';
// import fs from 'fs';
// import path from 'path';
// import { migrate } from 'drizzle-orm/postgres-js/migrator';
// import postgres from 'postgres';
// import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// async function main() {
//   const DATABASE_URL =
//     'postgresql://plaixa:plaixa25%40%21@192.168.68.106:31000/arbisus';

//   try {
//     const migrationClient = postgres(DATABASE_URL, { max: 1 });
//     const db: PostgresJsDatabase = drizzle(migrationClient);

//     console.log('Connected to database');

//     await migrate(db, { migrationsFolder: './drizzle' });

//     console.log('Migration completed');

//     await migrationClient.end();
//     console.log('Database connection closed');

//     process.exit(0);
//   } catch (error) {
//     console.error('Migration failed with error:', error);
//     process.exit(1);
//   }
// }

// main();
