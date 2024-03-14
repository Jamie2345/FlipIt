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

const to_review = (req, res) => {
    Deck.findOne({ name: req.body.name, user: req.userInfo.username })
    .then(deck => {
        const flashcards = deck.flashcards;
        console.log(flashcards);
        currentTime = Date.now();
        let cards_to_review = [];
        flashcards.forEach(card => {
            const reviewed_time = Date.parse(card.reviewed_time);
            const next_review = Date.parse(card.next_review);

            const time_until_review = (currentTime-next_review) - reviewed_time
          
            if (time_until_review <= 0) {
                cards_to_review.push(card);
            }
            
        })
        res.json(cards_to_review);
    });
}

const answer = (req, res) => {
  const { name, cardIndex, difficulty } = req.body;
  console.log(difficulty);
  function getDiffMultiplier(diff) {
    console.log(diff);
    const EASY_FACTOR = 2.5
    const GOOD_FACTOR = 1.8
    const NEW_FACTOR = 1.5
    const HARD_FACTOR = 1.2
    const VERY_HARD_FACTOR = 1.0

    let multiplier;
    if (diff=="New") {
      multiplier = NEW_FACTOR;
    }
    else if (diff=="Easy") {
      multiplier = EASY_FACTOR;
    }
    else if (diff=="Good") {
      multiplier = GOOD_FACTOR;
    }
    else if (diff=="Hard") {
      multiplier = HARD_FACTOR;
    }
    else if (diff=="Very Hard") {
      multiplier = VERY_HARD_FACTOR;
    }
    else {
      multiplier = GOOD_FACTOR;
    }

    return multiplier;
  }

  Deck.findOne({ name: name, user: req.userInfo.username })
  .then(deck => {
    const card = deck.flashcards[cardIndex];
    const multiplier1 = getDiffMultiplier(difficulty)
    const multiplier2 = getDiffMultiplier(card.difficulty)

    let time_to_wait = ((((multiplier1*multiplier2)**2) * (card.reviews+1)**1.75) * (1000**2)) + 300000 // 5 min smallest
    const stoppingLim = 5097600000;   // 2 months in milliseconds

    if (time_to_wait > stoppingLim) {
      time_to_wait = stoppingLim;
    }

    function convertMilliseconds(milliseconds) {
      // Create a Date object with the provided milliseconds
      let date = new Date(milliseconds);
  
      // Extract years, months, days, hours, minutes, and seconds from the Date object
      let years = date.getUTCFullYear() - 1970; // Subtract 1970 to get years since Unix epoch
      let months = date.getUTCMonth();
      let days = date.getUTCDate() - 1; // Subtract 1 to adjust for zero-based indexing
      let hours = date.getUTCHours();
      let minutes = date.getUTCMinutes();
      let seconds = date.getUTCSeconds();
  
      // Add leading zeros for single-digit components
      years = years < 10 ? "0" + years : years;
      months = months < 10 ? "0" + months : months;
      days = days < 10 ? "0" + days : days;
      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
  
      return `${years}:${months}:${days}:${hours}:${minutes}:${seconds}`;
    }
  
    // Example usage
    let duration = convertMilliseconds(time_to_wait);
    console.log(duration);
  

    console.log(time_to_wait)

    // update deck database

    deck.flashcards[cardIndex].reviews = card.reviews + 1;
    deck.flashcards[cardIndex].next_review = time_to_wait;
    deck.flashcards[cardIndex].difficulty = difficulty;
    deck.flashcards[cardIndex].wait_time = duration;
   
    deck.save()
    .then(savedDeck => {
      console.log(savedDeck)
      res.json(savedDeck)
    })
  });
};

module.exports = {
  // creating decks and flashcards and editing and deleting cards
  create,
  add,

  edit,
  remove,

  // getting decks
  decks,
  to_review,

  answer
}