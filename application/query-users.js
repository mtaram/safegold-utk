'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');

const ccpPath = path.resolve(__dirname, '../', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const walletPath = '../wallet';
const wallet = new FileSystemWallet(walletPath);

async function main() {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = {
    mobile_no: 'user1',
    value: 'Varun',
    distributor_id: 'ici123'
  };

   const res = await contract.evaluateTransaction('queryAllUsersByDistributor', JSON.stringify(payload));
  //  const res = await contract.evaluateTransaction('getPendingBalanceChanges', JSON.stringify({}));

  //  const res = await contract.evaluateTransaction('queryUserAccounts', JSON.stringify(payload))
  //  const res = await contract.evaluateTransaction('queryAllUsersByDistributor', JSON.stringify(payload))

  //  const user = JSON.parse(res.toString());
  try {
    let response = JSON.parse(res.toString())
    console.log(JSON.stringify(response, null, 4));
  } catch (e) {
    utils.parseError(e);
  };
  await gateway.disconnect();
};

main();
