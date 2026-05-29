# Upgrade chaincode rekammedis (setelah tambah GetAllPatientRecords)
# Jalankan: cd backend && powershell -ExecutionPolicy Bypass -File .\scripts\upgrade-rekammedis.ps1

$ErrorActionPreference = "Stop"
$ROOT = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$CHAINCODE_SRC = Join-Path $ROOT "chaincode"
$PEER1 = "peer0.org1.example.com"
$PEER2 = "peer0.org2.example.com"
$CHANNEL = "mychannel"
$CC_NAME = "rekammedis"
$CC_VERSION = "1.2"
$CC_LABEL = "${CC_NAME}_${CC_VERSION}"
$SEQUENCE = "4"

Push-Location $CHAINCODE_SRC
cmd /c "npm install --omit=dev"
Pop-Location

docker exec $PEER1 rm -rf /tmp/chaincode/rekammedis
docker exec $PEER1 mkdir -p /tmp/chaincode
docker cp "${CHAINCODE_SRC}/." "${PEER1}:/tmp/chaincode/rekammedis"
docker exec $PEER1 peer lifecycle chaincode package /tmp/rekammedis-upgrade.tar.gz --path /tmp/chaincode/rekammedis --lang node --label $CC_LABEL

docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/tmp/org1admin; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode install /tmp/rekammedis-upgrade.tar.gz"

docker cp "${PEER1}:/tmp/rekammedis-upgrade.tar.gz" "$env:TEMP\rekammedis-upgrade.tar.gz"
docker cp "$env:TEMP\rekammedis-upgrade.tar.gz" "${PEER2}:/tmp/rekammedis-upgrade.tar.gz"
docker exec $PEER2 bash -c "export CORE_PEER_LOCALMSPID=Org2MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/tmp/org2admin; export CORE_PEER_ADDRESS=peer0.org2.example.com:9051; peer lifecycle chaincode install /tmp/rekammedis-upgrade.tar.gz"

$installed = docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/tmp/org1admin; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode queryinstalled"
$packageId = ($installed | Select-String -Pattern "(${CC_LABEL}:[a-f0-9]+)" | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 1)
Write-Host "Package ID: $packageId"

$ORDERER_CA = "/tmp/orderer-ca.pem"
docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/tmp/org1admin; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL --name $CC_NAME --version $CC_VERSION --package-id $packageId --sequence $SEQUENCE"
docker exec $PEER2 bash -c "export CORE_PEER_LOCALMSPID=Org2MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/tmp/org2admin; export CORE_PEER_ADDRESS=peer0.org2.example.com:9051; peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL --name $CC_NAME --version $CC_VERSION --package-id $packageId --sequence $SEQUENCE"
docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/tmp/org1admin; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode commit -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL --name $CC_NAME --version $CC_VERSION --sequence $SEQUENCE --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /tmp/peer2-tls-ca.crt"

Write-Host "Done. Test: GetAllPatientRecords via WSL (setGlobals 1) or GET /api/fabric/ledger/all"
