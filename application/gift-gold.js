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

async function giftGold() {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = {
    sender: { mobile_no: 'user1' },
    receiver: { mobile_no: 'user2' },
    distributor_id: 'ici123',
    gold_amount: 1,
    tx_id: 'k122'
  };
  try {
    const res = await contract.submitTransaction('giftGold', JSON.stringify(payload));
    let response = JSON.parse(res.toString())
    console.log(JSON.stringify(response, null, 4));

  } catch (e) {
    utils.parseError(e);

  } finally {
    await gateway.disconnect();
  };
};

giftGold();
