```
{
  header: {
    number: '17',
    previous_hash: '7de935a4a2745f45707e103f87561f986b83f7368165ea06730331f9815e731e',
    data_hash: 'c7aaab0bd48dee9143b6e4549b62b8a0138095995bcdf939124706bb36d19691'
  },
  data: {
    // each element here is a transaction
    data: [{
      signature: <Buffer 30 55 22 xx xx xx xx --->,
      payload: {
        header: {
          channel_header: {
            type: 3,
            version: 1,
            timestamp: '2019-08-20T13:17:53.563Z',
            channel_id: 'mychannel',
            tx_id: '58ca6b6da364d83073f8361200fcdd3888b491b53e46c10af8c012ba69f44d1d',
            epoch: '0',
            extension: <Buffer 12 0a 12 08 73 61 66 65 47 6f 6c 64>,
            typeString: 'ENDORSER_TRANSACTION'
          },
          signature_header: {
            creator: [ obj ],  // Not sure about this. Is it everyone on the channel or cc?
            nonce: <Buffer 02 02 04 13 44 xx xx -->
          }
        },
        data: {
          // have to test this with a multi org environment
          actions: [{
            header: {
              creator: {
                Mspid: 'Org1MSP',
                IdBytes: '------BEGIN CERTIFICATE------\nxxxxxxxxxxxxxxxxx=\n--------END CERTIFICATE--------\n',
                none: <Buffer 02 44 87 12 xxxxxxxx -->
              }
            },
            payload: {
              chaincode_proposal_payload: {
                input: {
                  chaincode_spec: {
                    type: 1,
                    typeString: 'GOLANG',
                    input: {
                      args: [ Bufferxxxxxxx, Bufferxxxxxxxxx],
                      decorations: {}
                    },
                    chaincode_id: {
                      path: '',
                      name: 'safeGold',
                      version: ''
                    },
                    timeout: 0
                  }
                }
              },
              action: {
                proposal_response_payload: {
                    proposal_hash: '22221212sasasdasdadsaas',
                    extension: {
                      results: {
                        data_model: 0,
                        ns_rwset: [{
                          namespace: 'lscc', // first is always default lscc
                          rwset: {
                            reads:[{
                              key: 'safeGold',
                              version: {
                                block_num: 1,   (block installed on?)
                                tx_num: 0
                              }
                            }],
                            range_queries_info: [],
                            writes: [],
                            metadata_writes: []
                          },
                          collection_hashed_rwset: []
                        },
                        {
                          namespace: 'safeGold',
                          rwset: {
                            reads:[{
                              key: 'SOME_KEY_HERE',
                              version: {
                                block_num: 1,   (block last updated at)
                                tx_num: 0
                              }
                            }],
                            // Iterator resolved queries
                            range_queries_info: [{
                              start_key: '',
                              end_key: '',
                              itr_exhausted: true/ false,
                              raw_reads: []
                            }],
                            writes: [{
                              key: 'SOME_KEY_HERE',
                              is_delete: true/false,
                              value: 'NEW_VALUE_FOR_KEY_HERE'
                            }],
                            metadata_writes: []
                          },
                          collection_hashed_rwset: []
                        }]
                      },
                      events: { chaincode_id:'', tx_id:'', event_name:'', payload: <Buffer },
                      response: {
                        status: 200,
                        message: '',
                        payload: '{"success":false,"message":"User is already registered"}'
                      },
                      chaincode_id: { path: '', name: 'safeGold', version: '1.4' }
                    }
                },
                endorsements: [{
                  endorser: [],
                  signature: <Buffer 02 94 28 49 xxxxxxx -->
                }]
              }
            }
          }]
        }
      }
    }]
  },
  metadata: { metadata: [ [Object], [Object], [Array] ] }
}
  ```
