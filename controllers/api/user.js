var passport = require('passport');
var dbConfig = require('../../config/database');
require('../../config/passport')(passport);
var jwt = require('jsonwebtoken');
var router = require('express').Router();
var User = require('../../models/user');

router.get('/me', passport.authenticate('jwt', {session: false}), function (req, res) {
  var user = req.user;
  return res.json({
    username: user.username,
    balance: user.balance,
    card: user.card,
  });  
});

router.put('/me', passport.authenticate('jwt', {session: false}), function (req, res) {
  User.findOne({username: req.user.username}, function (err, user) {
    user.password = req.body.password;

    user.save(function (err) {
      if (err) {
        return res.json({success: false, msg: 'Can not update user data.'});
      }
      res.json({success: true, msg: 'Successfully updated user data.'});
    });
  });
});

router.put('/card', passport.authenticate('jwt', {session: false}), function (req, res) {
  User.findOne({username: req.user.username}, function (err, user) {
    user.card = {
      number: req.body.number,
      expire: req.body.expire,
      cvc: req.body.cvc,
    };

    user.save(function (err) {
      if (err) {
        return res.json({success: false, msg: 'Can not update card data.'});
      }
      res.json({success: true, msg: 'Successfully updated card data.'});
    });
  });
});

router.post('/charge', passport.authenticate('jwt', {session: false}), function (req, res) {
  User.findOne({username: req.user.username}, function (err, user) {
    // Payment module
    user.balance += parseInt(req.body.price);

    user.save(function (err) {
      if (err) {
        return res.json({success: false, msg: 'Can not charge the balance.'});
      }
      res.json({success: true, msg: 'Successfully charged the balance.'});
    });
  });
});

router.post('/sign_up', function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
    });

    newUser.save(function (err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successfully created new user.'});
    });
  }
});

router.post('/sign_in', function (req, res) {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), dbConfig.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

module.exports = router;
