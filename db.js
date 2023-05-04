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

const isHealthy = async function() {
    return connection.promise().query("SELECT 1")
}

const updateLatestBlock = async function(chain, block) {
    await connection.promise().query(`INSERT INTO BlockTracker (chain, latestBlock) VALUES (?, ?) ON DUPLICATE KEY UPDATE chain = ?, latestBlock = ?`, [chain, block, chain, block])
}

const getLatestBlock = async function(chain) {
    const [results] = await connection.promise().query("SELECT * FROM BlockTracker WHERE `chain` = ?", [chain])
    return results.length > 0 ? results[0] : undefined;
}

const storeTransactionData = async function(chain, from, to, token, amount) {
    await connection.promise().query("INSERT INTO AddressTransactionTracker (chain, fromAddress, toAddress, token, amount) VALUES (?, ?, ?, ?, ?)", [chain, from, to, token, amount])
}

const getTransactionHistory = async function(addresses) {
    const [results] = await connection.promise().query("SELECT chain, fromAddress, toAddress, token, amount FROM AddressTransactionTracker WHERE fromAddress IN (?) OR toAddress IN (?)", [addresses, addresses])

    return results.length > 0 ? results : undefined;
}

const closeDB = function() {
    // close the db connection
    connection.end((err) => {
        if (err) throw err;
        console.log('Connection closed');
    });
}


module.exports = {
    isHealthy, 
    getLatestBlock,
    updateLatestBlock,
    storeTransactionData,
    getTransactionHistory,
    closeDB
}