## Basic Network Config

Note that this basic configuration uses pre-generated certificates and
key material, and also has predefined transactions to initialize a
channel named "mychannel".

To regenerate this material, simply run ``generate.sh``.

To start the network, run ``start.sh``.
To stop it, run ``stop.sh``
To completely remove all incriminating evidence of the network
on your system, run ``teardown.sh``.

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>


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
