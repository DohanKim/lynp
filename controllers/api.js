var router = require('express').Router();

var printerRouter = require('./api/printer');
var userRouter = require('./api/user');

router.use('/', printerRouter);
router.use('/', userRouter);

module.exports = router;
