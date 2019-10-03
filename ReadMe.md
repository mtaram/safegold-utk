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
