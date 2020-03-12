#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

#set COMPOSE_PROJECT_NAME
export COMPOSE_PROJECT_NAME=net
#check COMPOSE_PROJECT_NAME
echo "COMPOSE_PROJECT_NAME is set to ${COMPOSE_PROJECT_NAME}"

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose-restore.yml up -d ca.safegold.com orderer.safegold.com peer0.org1.safegold.com couchdb cli
docker ps -a

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.safegold.com/msp" peer0.org1.safegold.com peer channel create -o orderer.safegold.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx
# Join peer0.org1.safegold.com to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.safegold.com/msp" peer0.org1.safegold.com peer channel join -b mychannel.block
