/**
 * @file Hyperledger Fabric Service
 * @description Service untuk integrasi dengan Hyperledger Fabric blockchain
 */

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const logger = require('../config/logger');

let gateway;
let contract;
let fabricInitialized = false;

function toArgStrings(args) {
    if (Array.isArray(args)) {
        return args.map((arg) => String(arg));
    }
    return Object.values(args).map((arg) => String(arg));
}

/**
 * Initialize koneksi ke Hyperledger Fabric network
 */
async function initializeFabric() {
    try {
        const walletPath = path.join(__dirname, '..', process.env.FABRIC_WALLET_PATH || './fabric/wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identityName = process.env.FABRIC_USERNAME || 'appUser';
        const identity = await wallet.get(identityName);
        if (!identity) {
            logger.warn(`Fabric user not found in wallet: ${identityName} at ${walletPath}`);
            return;
        }

        gateway = new Gateway();

        const networkProfile = require(path.join(
            __dirname,
            '..',
            process.env.FABRIC_NETWORK_PROFILE_PATH || './fabric/network_profile.json'
        ));

        const discoveryEnabled = process.env.FABRIC_DISCOVERY_ENABLED !== 'false';
        const asLocalhost = process.env.FABRIC_AS_LOCALHOST !== 'false';

        await gateway.connect(networkProfile, {
            wallet,
            identity: identityName,
            discovery: { enabled: discoveryEnabled, asLocalhost },
        });

        logger.info('Gateway connected successfully');

        const channelName = process.env.FABRIC_CHANNEL_NAME || 'mychannel';
        const chaincodeName = process.env.FABRIC_CHAINCODE_NAME || 'rekammedis';
        const contractName = process.env.FABRIC_CONTRACT_NAME || 'RekamMedisContract';

        logger.info(`Connecting channel=${channelName}, chaincode=${chaincodeName}, contract=${contractName}`);

        const network = await gateway.getNetwork(channelName);
        contract = network.getContract(chaincodeName, contractName);

        fabricInitialized = true;
        logger.info('Hyperledger Fabric gateway initialized successfully');
        console.log('✅ Hyperledger Fabric connected');
    } catch (error) {
        logger.error(`Failed to initialize Fabric gateway: ${error.message}`);
        logger.error(`Error stack: ${error.stack}`);
        console.error('❌ Failed to connect Hyperledger Fabric:', error.message);
    }
}

function getFabricStatus() {
    return {
        connected: fabricInitialized && Boolean(contract),
        contractInitialized: fabricInitialized && Boolean(contract),
        chaincode: process.env.FABRIC_CHAINCODE_NAME || 'rekammedis',
        contract: process.env.FABRIC_CONTRACT_NAME || 'RekamMedisContract',
        channel: process.env.FABRIC_CHANNEL_NAME || 'mychannel',
        identity: process.env.FABRIC_USERNAME || 'appUser',
    };
}

/**
 * Invoke chaincode (write). Mengembalikan transaction ID Fabric yang sebenarnya.
 * @param {string} functionName
 * @param {string[]|object} args - Array string berurutan, atau object (urutan values)
 * @returns {Promise<{txId: string, result: string}|null>}
 */
async function invokeChaincode(functionName, args) {
    if (!contract) {
        logger.warn('Fabric contract not initialized, skipping chaincode invocation');
        return null;
    }

    const argsArray = toArgStrings(args);
    const txn = contract.createTransaction(functionName);
    const resultBuffer = await txn.submit(...argsArray);
    const txId = txn.getTransactionId();
    const result = resultBuffer.toString();

    logger.info(`Chaincode invoked: ${functionName}, TxID: ${txId}`);
    return { txId, result };
}

/**
 * Query chaincode (read)
 */
async function queryChaincode(functionName, ...args) {
    if (!contract) {
        logger.warn('Fabric contract not initialized, skipping chaincode query');
        return null;
    }

    const argsArray = args.map((arg) => String(arg));
    const result = await contract.evaluateTransaction(functionName, ...argsArray);
    const resultString = result.toString();

    logger.info(`Chaincode queried: ${functionName}`);
    return resultString;
}

/**
 * Pastikan pasien sudah terdaftar di ledger sebelum AddDiagnosis
 */
async function ensurePatientOnChain(patient) {
    if (!contract) {
        return null;
    }

    const { nik, nama, alamat, tgl_lahir, jenis_kelamin } = patient;

    try {
        await queryChaincode('ReadPatientRecord', nik);
        return null;
    } catch {
        logger.info(`Registering patient on blockchain: ${nik}`);
        const result = await invokeChaincode('CreatePatientRecord', [
            nik,
            nama,
            alamat,
            tgl_lahir,
            jenis_kelamin,
        ]);
        return result?.txId || null;
    }
}

async function closeFabricConnection() {
    if (gateway) {
        await gateway.disconnect();
        fabricInitialized = false;
        contract = null;
        logger.info('Hyperledger Fabric gateway disconnected');
    }
}

module.exports = {
    initializeFabric,
    invokeChaincode,
    queryChaincode,
    ensurePatientOnChain,
    closeFabricConnection,
    getFabricStatus,
};
