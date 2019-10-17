#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
# This code is based on code written by the Hyperledger Fabric community.
# Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/startFabric.sh
#
# Exit on first error

set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

starttime=$(date +%s)

if [ ! -d ~/.hfc-key-store/ ]; then
	mkdir ~/.hfc-key-store/
fi
#set COMPOSE_PROJECT_NAME
export COMPOSE_PROJECT_NAME=net
#check COMPOSE_PROJECT_NAME
echo "COMPOSE_PROJECT_NAME is set to ${COMPOSE_PROJECT_NAME}"

# launch network; create channel and join peer to channel
cd ./basic-network
./stop.sh
./start.sh

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.safegold.com/users/Admin@org1.safegold.com/msp" cli peer chaincode install -n safeGold -v 1.0 -p /opt/gopath/src/github.com/safe-gold -l NODE

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.safegold.com/users/Admin@org1.safegold.com/msp" cli peer chaincode instantiate -o orderer.safegold.com:7050 -C mychannel -n safeGold -l NODE -v 1.0 -c '{"Args":["instantiate",""]}'

# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.safegold.com/users/Admin@org1.safegold.com/msp" cli peer chaincode upgrade -o orderer.safegold.com:7050 -C mychannel -n safeGold -l NODE -v 1.1 -c '{"Args":["instantiate",""]}'
