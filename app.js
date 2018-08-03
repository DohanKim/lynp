var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport');
var dbConfig = require('./config/database');
require('./config/passport')(passport);
var parserConfig = require('./config/parser');

var indexRouter = require('./controllers/index');
var apiRouter = require('./controllers/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json(parserConfig.json));
app.use(express.urlencoded(parserConfig.urlencoded));
var multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, './tmp/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
app.use(multer({storage: multerStorage}).single(parserConfig.fileFieldname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
// Enable CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect(dbConfig.database, dbConfig.options);

module.exports = app;
