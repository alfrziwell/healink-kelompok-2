const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

const args = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < args.length; i += 1) {
  const rawArg = args[i];
  if (!rawArg.startsWith('--')) continue;

  const [key, value] = rawArg.split(/=(.+)/);
  const normalizedKey = key.replace(/^--/, '');

  if (value !== undefined) {
    argMap[normalizedKey] = value;
  } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
    argMap[normalizedKey] = args[i + 1];
    i += 1;
  }
}

const certPath = argMap['fabric-cert'] || process.env.FABRIC_IMPORT_CERT;
const keyPath = argMap['fabric-key'] || process.env.FABRIC_IMPORT_KEY;
const mspId = argMap['fabric-msp'] || process.env.FABRIC_IMPORT_MSP;
const label = argMap['fabric-label'] || process.env.FABRIC_IMPORT_LABEL || 'appUser';
const walletPath = process.env.FABRIC_WALLET_PATH || './fabric/wallet';

function printUsage() {
  console.log('Usage: node scripts/importFabricIdentity.js --fabric-cert=/path/to/cert.pem --fabric-key=/path/to/key.pem --fabric-msp=Org1MSP --fabric-label=appUser');
  console.log('Or set env vars FABRIC_IMPORT_CERT, FABRIC_IMPORT_KEY, FABRIC_IMPORT_MSP, FABRIC_IMPORT_LABEL and run the same script.');
}

async function importIdentity() {
  if (!certPath || !keyPath || !mspId) {
    console.error('Error: missing required arguments.');
    printUsage();
    process.exit(1);
  }

  const resolvedCertPath = path.isAbsolute(certPath) ? certPath : path.join(process.cwd(), certPath);
  const resolvedKeyPath = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath);
  const resolvedWalletPath = path.isAbsolute(walletPath)
    ? walletPath
    : path.join(process.cwd(), walletPath);

  if (!fs.existsSync(resolvedCertPath)) {
    console.error(`Error: cert file not found at ${resolvedCertPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(resolvedKeyPath)) {
    console.error(`Error: key file not found at ${resolvedKeyPath}`);
    process.exit(1);
  }

  const certificate = fs.readFileSync(resolvedCertPath, 'utf8');
  const privateKey = fs.readFileSync(resolvedKeyPath, 'utf8');

  const wallet = await Wallets.newFileSystemWallet(resolvedWalletPath);

  const identity = {
    credentials: {
      certificate,
      privateKey,
    },
    mspId,
    type: 'X.509',
  };

  await wallet.put(label, identity);
  console.log(`✅ Identity '${label}' berhasil diimpor ke wallet: ${resolvedWalletPath}`);
}

importIdentity().catch((error) => {
  console.error('❌ Gagal mengimpor identity ke wallet:', error.message);
  process.exit(1);
});
