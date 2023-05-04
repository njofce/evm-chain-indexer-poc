const { ethers } = require("ethers");
const db = require('./db')
const processors = require('./transaction-processors')


const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
let canUpdateLatestBlock = false;

/**
 * 
 * Based on the latest block number stored in the database, the tracker first tries to sync the missing blocks, while listening to new blocks.
 * 
 * Important Note: Currently the tracker is always fetching latest block and is unoptimized. Due to reorgs, ideally the tracker should fetch blocks with a lag number, which is equal to the 
 * number that is considered a safe threshold for reorgs and the transaction can be considered Finalized. This number varies based on the chain.
 * 
 * 
 * @param chain The chain to run the tracker for
 * @returns 
 */
const runTracker = async function(chain) {
    await provider.ready
    await listenToNewBlocks(chain);
    const latestBlockInDatabaseData = await db.getLatestBlock(chain);

    if (latestBlockInDatabaseData == undefined) {
        canUpdateLatestBlock = true;
        return;
    }

    const latestBlockInDatabase = parseInt(latestBlockInDatabaseData.block)

    const latestBlockOnChain = await provider.getBlockNumber();

    // Backfill on startup. Can be optimized further with batch calls.
    for (var i = latestBlockInDatabase; i <= latestBlockOnChain; i++) {
        const block = await provider.getBlockWithTransactions(i)
        await processBlock(chain, block)
    }
    canUpdateLatestBlock = true;
}

const listenToNewBlocks = async function(chain) {
     provider.on('block', async(blockNumber) => {
        // An optimized version would check for chain that supports block receipts, and fetch block with receipts directly.
        const block = await provider.getBlockWithTransactions(blockNumber);
        await processBlock(chain, block)

        // Can start updating latest block in the database once the missing state is synced
        if (canUpdateLatestBlock) {
            await db.updateLatestBlock(chain, block.number)
        }
    })
}

const processBlock = async function(chain, block) {
    for (let tx of block.transactions) {
        const txReceipt = await provider.getTransactionReceipt(tx.hash);
        if (tx.data == '0x') {
            processRawTransfer(chain, tx, txReceipt)
        } else {
            processTransaction(chain, tx, txReceipt)
        }
    }
}

const processRawTransfer = async function(chain, txData, txReceipt) {
    const fromAddress = txReceipt.from;
    const toAddress = txReceipt.to;
    const ethValue = txData.value.toString()

    await db.storeTransactionData(chain, fromAddress, toAddress, 'ETH', ethValue)
}

const processTransaction = async function(chain, txData, txReceipt) {
    txReceipt.logs.forEach(async(log) => {
        const parsedLog = await processors.parseTransferLog(chain, txData, log)

        if (parsedLog != undefined) {
            await db.storeTransactionData(chain, parsedLog.fromAddress, parsedLog.toAddress, parsedLog.token, parsedLog.value)
        }

    })
}

module.exports = {runTracker}