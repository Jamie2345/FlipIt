const Deck = require('../models/Deck');
const User = require('../models/User');

const create = (req, res, next) => {
  const body = req.body;

  console.log(`body ${JSON.stringify(req.body)}`)

  Deck.findOne({creator: req.userInfo.username, name: body.name})
  .then(deckFound => {
    if (deckFound) {
      console.log('deck already exists with that name')
      res.sendStatus(409)
    }
    else {
      const deck = new Deck({
        name: body.name,
        topics: body.topics,
        creator: req.userInfo.username,
        user: req.userInfo.username
      })

      deck.save()

      .then(deck => {
        res.json(deck)
      })

      .catch(err => {
        console.log(err)
        res.json({
          message: 'Error saving deck'
        })
      });
    }
  })

}

const add = (req, res, next) => {
  const body = req.body;

  Deck.findOneAndUpdate(
    {name: body.name, user: req.userInfo.username},
    { $push: { 'flashcards': req.body.card } }, // new Card() may work
    { new: true }
  )
  .then(updatedDeck => {
    console.log(updatedDeck);
    // do something with the updated deck
    updatedDeck.save()

    .then(savedDeck => {
      res.json(savedDeck);
    })
  })
  .catch(err => {
    console.error(err);
    res.json({
      error: err.message
    })
  });

}

const edit = (req, res, next) => {
  const { name, editedCard, cardIndex } = req.body;

  const filter = {
    name: name,
    user: req.userInfo.username
  };

  const update = {
    $set: { [`flashcards.${cardIndex}`]: editedCard }
  };

  Deck.findOneAndUpdate(
    filter,
    update,
    { new: true }
  )
  .then(updatedDeck => {
    console.log(updatedDeck);
    // do something with the updated deck
    updatedDeck.save()
    .then(savedDeck => {
      res.json(savedDeck);
    })
  })
  .catch(err => {
    console.error(err);
    res.json({
      error: err.message
    })
  });
}

const remove = (req, res, next) => {
  const { name, cardIndex } = req.body;

  Deck.findOne({ name: name, user: req.userInfo.username })
  .then(deck => {
    deck.flashcards.splice(cardIndex, 1);
    deck.save()

    .then(savedDeck => {
      res.json(savedDeck)
    });

  })
  .catch(err => {
    console.log(err);
    res.json({
      message: "error"
    })
  })
}

const decks = (req, res, next) => {
  Deck.find({ user: req.userInfo.username })
  .then(decks => {
    return res.json(decks);
  })
  .catch(err => {
    res.json({
      message: 'error getting decks please try again'
    })
  });
}

module.exports = {
  // creating decks and flashcards and editing and deleting cards
  create,
  add,

  edit,
  remove,

  // getting decks
  decks
}