const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = require('./Flashcard');

const deckSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    topics: {
        type: Array
    },
    creator: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    flashcards: {
        type: [cardSchema]
    },
    total_time: {
        type: Number,
        required: true,
        default: 0
    },
    cards_introduced_today: {
        type: Number,
        default: 0
    },
    last_introduction: {
        type: Date
    }
}, {timestamps: true})

const Deck = mongoose.model('Deck', deckSchema)
module.exports = Deck