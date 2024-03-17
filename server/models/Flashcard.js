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
  difficulty: {
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
  },
  wait_time: {
    type: String,
  },
  next_review_time: {
    type: String,
  },
  reviews: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: false
  }
});

module.exports = cardSchema;