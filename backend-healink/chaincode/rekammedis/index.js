/**
 * Hyperledger Fabric Chaincode Entry Point
 */

'use strict';

const shim = require('fabric-shim');
const RekamMedisContract = require('./lib/rekammedis');

shim.start(new RekamMedisContract());
