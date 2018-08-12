var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  consumer: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  printerId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isColorPrinting: {
    type: Boolean,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
