'use strict';

const express = require('express');
const router = express.Router();
const usersCC = require('./users-cc.js');
const goldCC = require('./gold-cc.js');

router.post('/',
  usersCC.registerNewUser
);

router.post('/update-kyc',
  usersCC.updateUserKyc
);

router.post('/update-mobile-no',
  usersCC.updateMobileNo
);

router.post('/buy-gold',
  goldCC.buyGold
);

router.post('/sell-gold',
  goldCC.sellGold
);

router.post('/gift-gold',
  goldCC.giftGold
);

router.get('/',
  usersCC.getAllUsers
);

router.get('/distributors/:distributor_id',
  usersCC.getUsersForDistributor
);

router.get('/:id',
  usersCC.getUserByID
);

module.exports = router;
