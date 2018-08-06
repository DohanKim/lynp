var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dbConfig = require('../config/database');
var randomstring = require('randomstring');

var PrinterSchema = new Schema({
  printerId: {
    type: String,
    unique: true,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: [Number],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    default: 50,
  },
  isColorSupported: {
    type: Boolean,
    required: true,
  },
  isOn: {
    type: Boolean,
    required: true,
  },
  nonce: {
    type: String,
  },
});

PrinterSchema.pre('validate', function (next) {
  if (this.isNew) {
    this.isOn = false;
    this.nonce = randomstring.generate(dbConfig.randomstringLength);
  }

  return next();
});

module.exports = mongoose.model('Printer', PrinterSchema);
