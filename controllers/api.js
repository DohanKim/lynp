var router = require('express').Router();

var printerRouter = require('./api/printer');
var userRouter = require('./api/user');
var transactionRouter = require('./api/transaction');

router.use('/', printerRouter);
router.use('/', userRouter);
router.use('/', transactionRouter);

module.exports = router;
