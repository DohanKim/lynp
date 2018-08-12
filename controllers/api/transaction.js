var passport = require('passport');
var dbConfig = require('../../config/database');
require('../../config/passport')(passport);
var jwt = require('jsonwebtoken');
var router = require('express').Router();
var Transaction = require('../../models/transaction');

router.get('/print_history', passport.authenticate('jwt', {session: false}), function (req, res) {
  Transaction.find({consumer: req.user.username}).sort({'_id': -1}).exec((err, data) => {
    if (err) {
      console.log(err);
      return res.json({success: false, msg: 'Failed to find transactions.'});
    }
    res.json(data);
  });
});

router.get('/printer_history', passport.authenticate('jwt', {session: false}), function (req, res) {
  Transaction.find({owner: req.user.username}).sort({'_id': -1}).exec((err, data) => {
    if (err) {
      console.log(err);
      return res.json({success: false, msg: 'Failed to find transactions.'});
    }
    res.json(data);
  });
});

module.exports = router;
