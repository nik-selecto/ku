/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool } from 'pg';

async function pre() {
    const pool = new Pool({ user: 'postgres', password: 'postgres' });

    await pool.query(`--sql
        drop database if exists ku;
    `);
    await pool.query(`--sql
        create database ku;
    `);
    await pool.end();

    return new Pool({ user: 'postgres', password: 'postgres', database: 'ku' });
}

async function main() {
    const pool = new Pool({ user: 'postgres', password: 'postgres', database: 'ku' });

    const insertOne = await pool.query(`--sql
        select * from gepsert('a', '11', '11', '1', 3);
    `);
    console.log('insert 1:', insertOne.rows);

    const allRes = await pool.query(`--sql
        select * from asks;
    `);

    console.log('all 1:', allRes.rows);

    const insertTwo = await pool.query(`--sql
        select * from gepsert('a', '11', '2', '2', 3);
    `);

    console.log('insert 2:', insertTwo.rows);

    const allRes2 = await pool.query(`--sql
        select * from asks;
    `);

    console.log('all 2:', allRes2.rows);

    await pool.end();
}

(async () => {
    try {
        main();
    } catch (error) {
        console.error('=== ERROR ===');
        console.error(error);
        console.error('=============');
    }
})();
