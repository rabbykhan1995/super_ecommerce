import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbSchema } from '../../utils/relations';
import { DbTransactionClient } from '../../utils/runTransaction';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const db = drizzle(pool, {schema:dbSchema});

export default db;

export type QueryClient = typeof db | DbTransactionClient;