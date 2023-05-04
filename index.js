require('dotenv').config();
const express = require('express');
const db = require('./db.js');
const { runTracker } = require('./tracker.js');

const app = express();
app.use(express.json());

app.post('/transaction-history', async(req, res) => {
    const result = await db.getTransactionHistory(req.body.addresses)
    if (result != undefined) {
        res.send(result)
    } else 
        res.sendStatus(500);
});

app.post('/track', (req, res) => {
    const address = req.body.address
    const chain = req.body.chain

    console.log('Will start indexing the address activity')
    res.sendStatus(200);
});

app.get('/health', async(req, res) => {
    try {
        await db.isHealthy()
        res.sendStatus(200);
    } catch(e) {
        res.sendStatus(500);
    }
});

const server = app.listen(3000, async() => {
  console.log(`Server listening on port 3000.`);
  for (let chain of process.env.RPC_CHAINS.split(','))
    await runTracker(chain)
});
