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

async function registerNewUser(mobile_no) {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const payload = {
    user_id: 'SG-1',
    mobile_no: mobile_no,
    name: 'Varun',
    distributor_name: 'ICICI',
    distributor_id: 'ici123',
    email: 'varun@gmail.com',
    pin_code: 400034,
    kyc_requirement: {
      identity_required: true,
      pan_required: true
    }
  };
  try {
    const res = await contract.submitTransaction('registerNewUser', JSON.stringify(payload));
    let response = JSON.parse(res.toString())
    console.log(JSON.stringify(response, null, 4));

  } catch (e) {
    console.log('reached!!!!');
    utils.parseError(e);

  } finally {
    await gateway.disconnect();
  };
};


registerNewUser('9920');
// registerNewUser('user2');
// registerNewUser('user3');
