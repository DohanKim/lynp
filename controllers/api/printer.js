var passport = require('passport');
var dbConfig = require('../../config/database');
require('../../config/passport')(passport);
var jwt = require('jsonwebtoken');
var router = require('express').Router();
var {google} = require('googleapis');
var private_key = require('../../config/privatekey.json');
var request = require('request');
var Printer = require('../../models/printer');
var common = require('./common');
var fs = require('fs');

router.post('/printer', passport.authenticate('jwt', {session: false}), function (req, res) {
  var token = common.getToken(req.headers);
  if (token) {
    var newPrinter = new Printer({
      printerId: req.body.printer_id,
      model: req.body.model,
      owner: req.user.username,
      name: req.body.name,
      location: [req.body.lat, req.body.lng],
      address: req.body.address,
      isColorSupported: req.body.isColorSupported,
    });

    newPrinter.save(function (err) {
      if (err) {
        console.log(err);
        return res.json({success: false, msg: 'Save printer failed.'});
      }
      res.json({success: true, msg: 'Successful created new printer.'});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/printers', passport.authenticate('jwt', {session: false}), function (req, res) {
  var token = common.getToken(req.headers);
  if (token) {
    Printer.find(function (err, printers) {
      if (err) return next(err);
      res.json(printers);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/print', passport.authenticate('jwt', {session: false}), function (req, res) {
  var token = common.getToken(req.headers);
  if (token) {
    console.log(req.body);
    console.log("file: ", req.file);
    printFile(req.body.printer_id, req.file, req.user)
      .then(() => {
        res.json({success: true, msg: 'Successfully printed.'});
      }).catch(() => {
        res.status(401).send({success: false, msg: 'Print failed'});
      });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

printFile = function (printerId, file, user) {
  return new Promise(function(resolve, reject) {
    // configure a JWT auth client
    let jwt_client = new google.auth.JWT(
      private_key.client_email,
      null,
      private_key.private_key,
      ['https://www.googleapis.com/auth/cloudprint']);

    //authenticate request
    jwt_client.authorize(function (error, tokens) {
      if (error) {
        console.log(error);
        return;
      } else {
        console.log(tokens);

        // accept invitation
        var formData = {
          printerid : printerId,
          accept: 'true',
        };

        request.post(
          {
            url:'https://www.google.com/cloudprint/processinvite',
            formData: formData,
            headers: {
              'Authorization': 'Bearer ' + tokens.access_token,
            }
          },
          function optionalCallback(err, httpResponse, body) {
            if (err) {
              // console.error(err);
            } else {
              // console.log(body);
            }
          }
        );

        console.log(file);
        // submit a print job
        var formData = {
          printerid : printerId,
          title: 'Printing request of ' + user.username + ': ' + file.originalname,
          ticket: JSON.stringify({version: '1.0', print: {}}),
          content: fs.createReadStream(file.path),
          contentType: file.mimetype,
        };
        console.log(formData);

        request.post(
          {
            url: 'https://www.google.com/cloudprint/submit',
            formData: formData,
            headers: {
              'Authorization': 'Bearer ' + tokens.access_token,
            }
          },
          function optionalCallback(err, httpResponse, body) {
            var jbody = JSON.parse(body);
            console.log(jbody);
            if (err || jbody.success == false) {
              console.error(err);
              reject(Error());
            } else {
              console.log(body);
              resolve();
            }
          }
        );
      }
    });
  });
}

module.exports = router;