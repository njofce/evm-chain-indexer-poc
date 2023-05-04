const { ethers } = require("ethers");

const contractAddresses = {
    "goerli": {
        "0x2f3a40a3db8a7e3d09b0adfefbce4f6f81927557": {
            token: 'USDC',
            decimals: 6
        },
        "0x509ee0d083ddf8ac028f2a56731412edd63223b9": {
            token: "USDT",
            decimals: 6
        },
        "0x9d233a907e065855d2a9c7d4b552ea27fb2e5a36": {
            token: "DAI",
            decimals: 18
        },
        "0xf06605C57289098Cb82b284c0D2Dcbc3ba84d2d0": {
            token: "tUSDC",
            decimals: 6
        }
    }
}

const parseTransferLog = async function(chain, txData, log) {
    const abi = [ "event Transfer(address indexed from, address indexed to, uint256 value)" ];
    var iTransfer = new ethers.utils.Interface(abi);

    const contractAddress = txData.to;

    try {
        const parsed = iTransfer.parseLog(log);


        const trackedToken = contractAddresses[chain][contractAddress]

        if (trackedToken != undefined) {

            const fromAddress = parsed.args[0];
            const toAddress = parsed.args[1];
            const valueInTokenDecimals = parsed.args[2];
            const valueWithFormattedDecimals = ethers.utils.formatUnits(valueInTokenDecimals, trackedToken.decimals);
            const valueInDefaultDecimals = ethers.utils.parseUnits(valueWithFormattedDecimals.toString(), 18);
            return {
                fromAddress, 
                toAddress, 
                value: valueInDefaultDecimals.toString(), 
                token: trackedToken.token
            }
        }
        
    } catch(e) {
        return undefined
    }
}

module.exports = {
    parseTransferLog
}