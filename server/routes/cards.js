const express = require('express')
const router = express.Router()

const FlashcardsConroller = require('../controllers/FlashcardsController')

// manage flashcards and decks
router.post('/create', FlashcardsConroller.create)

router.put('/add', FlashcardsConroller.add)
router.put('/bulk_add', FlashcardsConroller.bulk_add)
router.put('/edit', FlashcardsConroller.edit)

router.delete('/remove_card', FlashcardsConroller.remove)

// get flashcards and decks
router.get('/deck', FlashcardsConroller.deck)
router.get('/decks', FlashcardsConroller.decks)

router.get('/review', FlashcardsConroller.to_review)
router.get('/nearest_card_time', FlashcardsConroller.next_card_time)
router.post('/answer', FlashcardsConroller.answer)

module.exports = router