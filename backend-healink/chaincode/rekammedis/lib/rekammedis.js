/**
 * @file Hyperledger Fabric Chaincode Example
 * @description Contoh Chaincode untuk mencatat dan query medical records
 * 
 * Bahasa: JavaScript (Node.js Chaincode)
 * 
 * CATATAN: File ini adalah referensi untuk membuat chaincode Anda sendiri.
 * Simpan di folder chaincode/ dan deploy ke Hyperledger Fabric network.
 * 
 * STRUKTUR FOLDER:
 * chaincode/
 * ├── rekammedis/
 * │   ├── package.json
 * │   ├── index.js
 * │   └── lib/
 * │       └── rekammedis.js
 * 
 * DEPLOY COMMAND:
 * peer lifecycle chaincode package rekammedis.tar.gz \
 *   --path ./chaincode/rekammedis/ \
 *   --lang node \
 *   --label rekammedis_1
 */

'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * Medical Records Chaincode Contract
 */
class RekamMedisContract extends Contract {
    
    /**
     * Initialize ledger dengan data default
     */
    async initLedger(ctx) {
        console.log('============= START : Initialize Ledger ===========');
        console.log('Initializing ledger...');
        console.log('============= END : Initialize Ledger ===========');
    }

    /**
     * Invoke - Record Medical Data ke Blockchain
     * @param {string} id - Unique identifier untuk medical record
     * @param {object} medicalData - Data diagnosa/medical record
     * @returns {object} Hasil pencatatan
     */
    async recordMedis(ctx, ...args) {
        console.log('============= START : recordMedis ===========');
        
        if (args.length !== 7) {
            throw new Error('Incorrect number of arguments. Expecting 7');
        }

        // Parse arguments
        const medicalRecord = {
            docType: 'medicalRecord',
            id: ctx.txID, // Transaction ID sebagai unique identifier
            tanggal: args[0],
            id_rs: args[1],
            id_dokter: args[2],
            nik_pasien: args[3],
            nama_diagnosa: args[4],
            kriteria_ciri: args[5],
            obat: args[6],
            createdAt: new Date().toISOString(),
            status: 'recorded',
        };

        // Save ke blockchain
        await ctx.stub.putState(ctx.txID, Buffer.from(JSON.stringify(medicalRecord)));
        console.log(`Medical record recorded: ${ctx.txID}`);
        
        console.log('============= END : recordMedis ===========');
        return ctx.txID; // Return transaction ID
    }

    /**
     * Query - Get Medical Record dari Blockchain
     * @param {string} txId - Transaction ID
     * @returns {object} Medical record data
     */
    async queryDiagnosa(ctx, txId) {
        console.log('============= START : queryDiagnosa ===========');
        
        const recordAsBytes = await ctx.stub.getState(txId);
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`Medical record ${txId} does not exist`);
        }

        console.log(recordAsBytes.toString());
        console.log('============= END : queryDiagnosa ===========');
        
        return recordAsBytes.toString();
    }

    /**
     * Query - Get All Medical Records
     * @returns {array} All medical records
     */
    async queryAll(ctx) {
        console.log('============= START : queryAll ===========');
        
        const startKey = '';
        const endKey = '';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        let res = await iterator.next();
        
        while (!res.done) {
            if (res.value) {
                const strValue = Buffer.from(res.value.value.buffer).toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    console.log(err);
                    record = strValue;
                }
                allResults.push({ Key: res.value.key, Record: record });
            }
            res = await iterator.next();
        }

        await iterator.close();
        console.log(allResults);
        console.log('============= END : queryAll ===========');
        
        return JSON.stringify(allResults);
    }

    /**
     * Query - Get Medical Records by Patient
     * @param {string} nikPasien - Patient NIK
     * @returns {array} Medical records for patient
     */
    async queryByPasien(ctx, nikPasien) {
        console.log('============= START : queryByPasien ===========');
        
        const queryString = {
            selector: {
                docType: 'medicalRecord',
                nik_pasien: nikPasien,
            },
        };

        const iterator = await ctx.stub.getQueryResultsForQueryString(JSON.stringify(queryString));

        const allResults = [];
        let res = await iterator.next();
        
        while (!res.done) {
            if (res.value) {
                const strValue = Buffer.from(res.value.value.buffer).toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    console.log(err);
                    record = strValue;
                }
                allResults.push({ Key: res.value.key, Record: record });
            }
            res = await iterator.next();
        }

        await iterator.close();
        console.log('============= END : queryByPasien ===========');
        
        return JSON.stringify(allResults);
    }

    /**
     * Query - Get Medical Records by Doctor
     * @param {string} idDokter - Doctor ID
     * @returns {array} Medical records created by doctor
     */
    async queryByDokter(ctx, idDokter) {
        console.log('============= START : queryByDokter ===========');
        
        const queryString = {
            selector: {
                docType: 'medicalRecord',
                id_dokter: idDokter,
            },
        };

        const iterator = await ctx.stub.getQueryResultsForQueryString(JSON.stringify(queryString));

        const allResults = [];
        let res = await iterator.next();
        
        while (!res.done) {
            if (res.value) {
                const strValue = Buffer.from(res.value.value.buffer).toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    console.log(err);
                    record = strValue;
                }
                allResults.push({ Key: res.value.key, Record: record });
            }
            res = await iterator.next();
        }

        await iterator.close();
        console.log('============= END : queryByDokter ===========');
        
        return JSON.stringify(allResults);
    }

    /**
     * Invoke - Update Medical Record Status
     * @param {string} txId - Transaction ID
     * @param {string} newStatus - New status
     */
    async updateStatus(ctx, txId, newStatus) {
        console.log('============= START : updateStatus ===========');
        
        const recordAsBytes = await ctx.stub.getState(txId);
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`Medical record ${txId} does not exist`);
        }

        const record = JSON.parse(recordAsBytes.toString());
        record.status = newStatus;
        record.updatedAt = new Date().toISOString();

        await ctx.stub.putState(txId, Buffer.from(JSON.stringify(record)));
        console.log('Medical record status updated');
        
        console.log('============= END : updateStatus ===========');
    }

    /**
     * Invoke - Delete Medical Record (untuk testing saja)
     * @param {string} txId - Transaction ID
     */
    async deleteMedis(ctx, txId) {
        console.log('============= START : deleteMedis ===========');
        
        const recordAsBytes = await ctx.stub.getState(txId);
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`Medical record ${txId} does not exist`);
        }

        await ctx.stub.deleteState(txId);
        console.log('Medical record deleted');
        
        console.log('============= END : deleteMedis ===========');
    }
}

module.exports = RekamMedisContract;
