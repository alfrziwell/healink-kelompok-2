require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fabric = require('../services/fabricService');

(async () => {
    await fabric.initializeFabric();
    const nik = '3273012345678901';
    const txId = '14d49743d13feae6b9fa44cbbf7d5b92d2b1e4b3b06a92a3cb072abc9582f3d6';
    const history = await fabric.queryChaincode('GetPatientMedicalHistory', nik);
    const records = JSON.parse(history);
    const found = records.find((r) => r.txId === txId);
    console.log('LEDGER_RECORDS:', records.length);
    console.log('TX_FOUND:', found ? 'YES' : 'NO');
    if (found) console.log('MATCH:', JSON.stringify(found, null, 2));
    const state = await fabric.queryChaincode('ReadPatientRecord', nik);
    const patient = JSON.parse(state);
    console.log('DIAGNOSES_ON_LEDGER:', patient.diagnosa?.length || 0);
    console.log('LATEST:', JSON.stringify(patient.diagnosa?.slice(-1), null, 2));
    process.exit(0);
})().catch((e) => { console.error('ERR:', e.message); process.exit(1); });
