const express = require('express')
const router = express.Router()

const FlashcardsConroller = require('../controllers/FlashcardsController')

// manage flashcards and decks
router.post('/create', FlashcardsConroller.create)

router.put('/add', FlashcardsConroller.add)
router.put('/edit', FlashcardsConroller.edit)

router.delete('/remove_card', FlashcardsConroller.remove)

// get flashcards and decks
router.get('/decks', FlashcardsConroller.decks)

router.get('/review', FlashcardsConroller.to_review)

module.exports = router