## Start the network
- Either run `startFabric.sh` OR

```
cd basic-network
./start.sh
```

## Bootstrap via scripts
Init chaincode via scripts
```
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n safeGold -v 1.0 -p /opt/gopath/src/github.com/safe-gold -l NODE
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n safeGold -l NODE -v 1.0 -c '{"Args":["instantiate",""]}'
```

To update use
```
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode upgrade -o orderer.example.com:7050 -C mychannel -n safeGold -l NODE -v 1.1 -c '{"Args":["instantiate",""]}'
```
To stop the network do `./stop.sh` and if needed go `./teardown.sh`

## Add peer
https://medium.com/@wahabjawed/extending-hyperledger-fabric-network-adding-a-new-peer-4f52f70a7217

export CHANNEL_NAME=mychannel
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/safegold.com/orderers/orderer.safegold.com/msp/tlscacerts/tlsca.safegold.com-cert.pem
echo $CHANNEL_NAME
echo $ORDERER_CA


peer channel fetch config config_block.pb -o orderer.safegold.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA

update peer count in crypto-config.yaml

CORE_PEER_LOCALMSPID="Org1MSP"
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.safegold.com/peers/peer0.org1.safegold.com/tls/ca.crt
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.safegold.com/users/Admin@org1.safegold.com/msp
CORE_PEER_ADDRESS=peer0.org1.safegold.com:7051

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.safegold.com/msp" peer1.org1.safegold.com peer channel create -o orderer.safegold.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.safegold.com/msp" peer1.org1.safegold.com peer channel join -b mychannel.block

//Join peer1.org1.example.com to the channel.

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.safegold.com/msp" -e "CORE_PEER_ADDRESS=peer1.org1.safegold.com:7051" peer0.org1.safegold.com peer channel join -b mychannel.block

## Bootstrap via APIs
TODO:




## Init users
Initiate the bootstrap identities. Create an empty `wallet` folder in the root directory if there isn't one
```
node enrollAdmin.js
node registerUser.js
```
The keys for admin and user are stored in `./wallet`
By default transactions should use `user` and not `admin`

### TODO Feature set
- Add pagination everywhere
- composite keys must have timestamp in them to query in an order, or mango queries?
- Archive delta transactions once they are deleted
- Buy, sell, gift gold - fix variable names
- Add events


## Multi host peer
What works for adding peer1 to safegold network

on server 1
docker exec orderer.safegold.com /bin/sh -c "echo 139.59.36.231 peer1.org1.safegold.com >> /etc/hosts"
docker exec ca.safegold.com /bin/sh -c "echo 139.59.36.231 peer1.org1.safegold.com >> /etc/hosts"
docker exec peer0.org1.safegold.com /bin/sh -c "echo 139.59.36.231 peer1.org1.safegold.com >> /etc/hosts"

on server 2
docker exec peer1.org1.safegold.com /bin/sh -c "echo 139.59.36.226 peer0.org1.safegold.com >> /etc/hosts"
docker exec peer1.org1.safegold.com /bin/sh -c "echo 139.59.36.226 orderer.safegold.com >> /etc/hosts"
docker exec peer1.org1.safegold.com /bin/sh -c "echo 139.59.36.226 ca.safegold.com >> /etc/hosts"

fetch channel info
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer" peer1.org1.safegold.com peer channel fetch config -o orderer.safegold.com:7050 -c mychannel

copy mychannel.block to the new peer host

docker cp peer0.org1.safegold.com:/opt/gopath/src/github.com/hyperledger/fabric/mychannel.block .
scp mychannel.block algo@139.59.36.231:

copy mychannel.block inside peer container
docker cp mychannel.block peer1.org1.safegold.com:/opt/gopath/src/github.com/hyperledger/fabric/mychannel.block

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.safegold.com/msp" peer1.org1.safegold.com peer channel join -b mychannel.block

