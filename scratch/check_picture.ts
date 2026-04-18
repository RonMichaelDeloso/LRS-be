import pool from '../src/config/db.js';

async function checkUsers() {
    try {
        const [rows]: any = await pool.query('SELECT User_id, First_name, picturepic FROM users ORDER BY User_id DESC LIMIT 5');
        console.log('Last 5 users in DB:');
        rows.forEach((row: any) => {
            console.log(`ID: ${row.User_id}, Name: ${row.First_name}, picturepic: ${row.picturepic}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error checking users:', err);
        process.exit(1);
    }
}

checkUsers();
