import { Pool } from 'pg';

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'budgetapp',
    password: 'pepsi1234',
    port: 5432,
})