import pool from '../src/config/db.js';

async function checkSchema() {
    try {
        const [columns]: any = await pool.query('SHOW COLUMNS FROM users');
        console.log('Columns in users table:');
        columns.forEach((col: any) => console.log(`- ${col.Field} (${col.Type})`));
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
