# Deploy chaincode rekammedis ke Fabric test-network (Docker)
# Jalankan dari PowerShell: .\scripts\deploy-rekammedis.ps1

$ErrorActionPreference = "Stop"

$ROOT = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$CHAINCODE_SRC = Join-Path $ROOT "chaincode"
$PEER1 = "peer0.org1.example.com"
$PEER2 = "peer0.org2.example.com"
$CHANNEL = "mychannel"
$CC_NAME = "rekammedis"
$CC_VERSION = "1.0"
$CC_LABEL = "${CC_NAME}_${CC_VERSION}"
$SEQUENCE = "1"

Write-Host "==> Install npm dependencies chaincode..."
Push-Location $CHAINCODE_SRC
cmd /c "npm install --omit=dev"
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "npm install gagal" }
Pop-Location

Write-Host "==> Copy chaincode ke peer containers..."
docker exec $PEER1 rm -rf /tmp/chaincode/rekammedis 2>$null
docker exec $PEER1 mkdir -p /tmp/chaincode
docker cp "${CHAINCODE_SRC}/." "${PEER1}:/tmp/chaincode/rekammedis"

Write-Host "==> Package chaincode..."
docker exec $PEER1 peer lifecycle chaincode package /tmp/rekammedis.tar.gz `
    --path /tmp/chaincode/rekammedis --lang node --label $CC_LABEL

function Set-Org1Env {
    docker exec $PEER1 bash -c @"
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
"@
}

function Set-Org2Env {
    docker exec $PEER2 bash -c @"
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
export CORE_PEER_ADDRESS=peer0.org2.example.com:9051
"@
}

Write-Host "==> Install on Org1 peer..."
docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode install /tmp/rekammedis.tar.gz"

Write-Host "==> Copy package to Org2 and install..."
docker cp "${PEER1}:/tmp/rekammedis.tar.gz" "$env:TEMP\rekammedis.tar.gz"
docker cp "$env:TEMP\rekammedis.tar.gz" "${PEER2}:/tmp/rekammedis.tar.gz"
docker exec $PEER2 bash -c "export CORE_PEER_LOCALMSPID=Org2MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp; export CORE_PEER_ADDRESS=peer0.org2.example.com:9051; peer lifecycle chaincode install /tmp/rekammedis.tar.gz"

Write-Host "==> Get package ID..."
$installed = docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode queryinstalled"
Write-Host $installed
$packageId = ($installed | Select-String -Pattern "${CC_LABEL}:(\S+)" | ForEach-Object { $_.Matches[0].Groups[1].Value })
if (-not $packageId) {
    throw "Package ID tidak ditemukan. Pastikan install berhasil."
}
Write-Host "Package ID: $packageId"

$ORDERER_CA = "/etc/hyperledger/fabric/orderer/tlsca.crt"
$ORDERER_ADDR = "orderer.example.com:7050"

Write-Host "==> Approve Org1..."
docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode approveformyorg -o ${ORDERER_ADDR} --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${ORDERER_CA} --channelID ${CHANNEL} --name ${CC_NAME} --version ${CC_VERSION} --package-id ${packageId} --sequence ${SEQUENCE}"

Write-Host "==> Approve Org2..."
docker exec $PEER2 bash -c "export CORE_PEER_LOCALMSPID=Org2MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp; export CORE_PEER_ADDRESS=peer0.org2.example.com:9051; peer lifecycle chaincode approveformyorg -o ${ORDERER_ADDR} --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${ORDERER_CA} --channelID ${CHANNEL} --name ${CC_NAME} --version ${CC_VERSION} --package-id ${packageId} --sequence ${SEQUENCE}"

Write-Host "==> Commit chaincode..."
docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer lifecycle chaincode commit -o ${ORDERER_ADDR} --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${ORDERER_CA} --channelID ${CHANNEL} --name ${CC_NAME} --version ${CC_VERSION} --sequence ${SEQUENCE} --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt"

Write-Host "==> Init ledger..."
docker exec $PEER1 bash -c "export CORE_PEER_LOCALMSPID=Org1MSP; export CORE_PEER_TLS_ENABLED=true; export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp; export CORE_PEER_ADDRESS=peer0.org1.example.com:7051; peer chaincode invoke -o ${ORDERER_ADDR} --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${ORDERER_CA} -C ${CHANNEL} -n ${CC_NAME} -c '{\"function\":\"InitLedger\",\"Args\":[]}' --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt"

Write-Host ""
Write-Host "✅ Chaincode rekammedis deployed. Set .env: FABRIC_CHAINCODE_NAME=rekammedis"
Write-Host "   Restart backend: npm start"
