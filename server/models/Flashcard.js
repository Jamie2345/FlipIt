const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  dificulty: {
    type: String,
    default: 'New'
  },
  reviewed_time: {
    type: Date,
    default: Date.now
  },
  next_review: {
    type: Number,
    default: 0
  }
});

module.exports = cardSchema;