'use strict';

const express = require('express');
const router = express.Router();
const sgCC = require('./safe-gold-cc.js');

router.post('/tally',
  sgCC.tallySafeGoldBalance
);

router.get('/',
  sgCC.getSafeGoldBalance
);

router.get('/total',
  sgCC.getTotalVaultBalance
);

router.post('/add-gold-proposal',
  sgCC.initiateProposal
);

router.post('/approve-proposal',
  sgCC.trusteeApproval
);

router.post('/confirm-delivery',
  sgCC.custodianConfirmsDelivery
);


module.exports = router;
