require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// connect to the database
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to indexer database');
});

connection.execute(
    `CREATE TABLE BlockTracker (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        chain VARCHAR(100) NOT NULL UNIQUE,
        latestBlock VARCHAR(120) NOT NULL,
        INDEX chain_index (chain)
    )
    `
);

connection.execute(`
    CREATE TABLE AddressTransactionTracker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chain VARCHAR(100) NOT NULL,
        fromAddress VARCHAR(42),
        toAddress VARCHAR(42),
        token VARCHAR(100),
        amount VARCHAR(40)
    )
`)

console.log('DB migrated successfully')
connection.end();