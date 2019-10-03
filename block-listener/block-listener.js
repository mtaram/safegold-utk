'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '../', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const walletPath = '../wallet';
const wallet = new FileSystemWallet(walletPath);



const main = async () => {
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('safeGold');
  const listener = await network.addBlockListener('offchain-listener',
      async (err, block) => {
          if (err) {
              console.error(err);
              return;
          };
          console.log(block.metadata.metadata[2]);
          // let response = JSON.parse(block.toString())
          // console.log(JSON.stringify(block.data, null, 4));
          // console.log(block.data.data[0].payload.data);
          // console.log(block.data.data[0].payload.header.signature_header);
          // console.log(block.data.data[0].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.range_queries_info[0].raw_reads);
          // console.log(block.data);
          // console.log(block.data.data[0].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec);
          let blockNumber = block.header.number;
          let timestamp = block.data.data[0].payload.header.channel_header.timestamp;
          let channel = block.data.data[0].payload.header.channel_header.channel_id;

          let action = block.data.data[0].payload.data.actions[0];
          let actionArr = block.data.data[0].payload.data.actions;

          let txCreator = action.header.creator.Mspid; // Is this all MSP or one?
          let ns_rwset = action.payload.action.proposal_response_payload.extension.results.ns_rwset[0];
          for (var i = 0; i < actionArr.length; i++) {
            let action = actionArr[i];
          }
          let namespace = ns_rwset.namespace

          // Each element in ns_rwset arr is one transaction
          let rwset = ns_rwset.rwset;
          let reads = rwset.reads;
          let writes = rwset.writes;
          let range_queries_info = rwset.range_queries_info;

          console.log('\n\n------------New block received- Number: ' + blockNumber + ' on channel: ' + channel + ' at: ' + timestamp + ' ------------');
          // console.log(action.payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.reads);
          // console.log(action.payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.writes);
          // console.log(actionArr);
          let tx = block.data.data;
          for (var i = 0; i < tx.length; i++) {
            let actionArr = tx[i].payload.data.actions;
            console.log('\nTransaction ' + (i+1) + ' with ID ' + tx[i].payload.header.channel_header.tx_id);
            console.log('Function called ' + tx[i].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[0].toString());
            // console.log('Transaction ' + (i+1) + ' with ID ' + tx[i].payload.header.channel_header.tx_id + ' with actions ' + actionArr.length);
            let mySet = tx[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset;
            console.log(JSON.stringify(mySet, null, 4));
          };
          // let mySet = tx[2].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset;
          // console.log(JSON.stringify(mySet, null, 4));
      });
};

main();



// Sample block
// { header:
//    { number: '15',
//      previous_hash: 'd44e2e3d4ec0f91e25161cece54511a6c175028e58c9966a170c8f7b9b2415d4',
//      data_hash: 'de670255da8427a806435c2590ef962da5b9194796613b09627ed92fc3b58af6' },
//   data: { data: [ [Object] ] },
//   metadata: { metadata: [ [Object], [Object], [Array] ] } }



/**
TxValidationCode_VALID                        TxValidationCode = 0

TxValidationCode_NIL_ENVELOPE                 TxValidationCode = 1
TxValidationCode_BAD_PAYLOAD                  TxValidationCode = 2
TxValidationCode_BAD_COMMON_HEADER            TxValidationCode = 3
TxValidationCode_BAD_CREATOR_SIGNATURE        TxValidationCode = 4
TxValidationCode_INVALID_ENDORSER_TRANSACTION TxValidationCode = 5
TxValidationCode_INVALID_CONFIG_TRANSACTION   TxValidationCode = 6
TxValidationCode_UNSUPPORTED_TX_PAYLOAD       TxValidationCode = 7
TxValidationCode_BAD_PROPOSAL_TXID            TxValidationCode = 8
TxValidationCode_DUPLICATE_TXID               TxValidationCode = 9
TxValidationCode_ENDORSEMENT_POLICY_FAILURE   TxValidationCode = 10
TxValidationCode_MVCC_READ_CONFLICT           TxValidationCode = 11
TxValidationCode_PHANTOM_READ_CONFLICT        TxValidationCode = 12
TxValidationCode_UNKNOWN_TX_TYPE              TxValidationCode = 13
TxValidationCode_TARGET_CHAIN_NOT_FOUND       TxValidationCode = 14
TxValidationCode_MARSHAL_TX_ERROR             TxValidationCode = 15
TxValidationCode_NIL_TXACTION                 TxValidationCode = 16
**/
