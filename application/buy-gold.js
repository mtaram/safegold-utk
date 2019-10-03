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

async function buyGold() {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = {
    mobile_no: 'user1',
    distributor_id: 'ici123',
    gold_amount: '5',
    tx_id: 'k122'
  };
  try {
    const res = await contract.submitTransaction('buyGold', JSON.stringify(payload));
    let response = JSON.parse(res.toString())
    console.log(JSON.stringify(response, null, 4));

  } catch (e) {
    utils.parseError(e);

  } finally {
    await gateway.disconnect();
  };
};

buyGold();
