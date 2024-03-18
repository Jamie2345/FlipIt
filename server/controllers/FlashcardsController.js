const Deck = require("../models/Deck");
const User = require("../models/User");

const cardsPerDay = 10;  // amount of new cards to introduce each day

function convertMillisecondsToTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months >= 1) {
    return months + (months === 1 ? " month" : " months");
  } else if (days >= 1) {
    return days + (days === 1 ? " day" : " days");
  } else if (hours >= 1) {
    return hours + (hours === 1 ? " hour" : " hours");
  } else if (minutes >= 1) {
    return minutes + (minutes === 1 ? " minute" : " minutes");
  } else {
    return seconds + (seconds === 1 ? " second" : " seconds");
  }
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



const create = (req, res, next) => {
  const body = req.body;

  console.log(`body ${JSON.stringify(req.body)}`);

  Deck.findOne({ creator: req.userInfo.username, name: body.name }).then(
    (deckFound) => {
      if (deckFound) {
        console.log("deck already exists with that name");
        res.sendStatus(409);
      } else {
        const deck = new Deck({
          name: body.name,
          topics: body.topics,
          creator: req.userInfo.username,
          user: req.userInfo.username,
        });

        deck
          .save()
          .then((deck) => {
            res.json(deck);
          })

          .catch((err) => {
            console.log(err);
            res.json({
              message: "Error saving deck",
            });
          });
      }
    }
  );
};

const add = (req, res, next) => {
  const body = req.body;

  Deck.findOneAndUpdate(
    { name: body.name, user: req.userInfo.username },
    { $push: { flashcards: req.body.card } }, // new Card() may work
    { new: true }
  )
    .then((updatedDeck) => {
      if (updatedDeck) {
        // do something with the updated deck
        updatedDeck.save().then((savedDeck) => {
          res.json(savedDeck);
        });
      } else {
        res.json({ msg: "deck not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({
        error: err.message,
      });
    });
};

const bulk_add = (req, res) => {
  const body = req.body;
  const cards = body.cards;
  
  Deck.findOneAndUpdate(
    { name: body.name, user: req.userInfo.username },
    { $push: { flashcards: cards } }, // Using $each with the entire cards array
    { new: true }
  )
  .then((updatedDeck) => {
    if (updatedDeck) {
      // do something with the updated deck
      updatedDeck.save().then((savedDeck) => {
        res.json(savedDeck);
      });
    } else {
      res.json({ msg: "Deck not found" });
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
    });
  });
};

const edit = (req, res, next) => {
  const { name, editedCard, cardIndex } = req.body;

  const filter = {
    name: name,
    user: req.userInfo.username,
  };

  const update = {
    $set: { [`flashcards.${cardIndex}`]: editedCard },
  };

  Deck.findOneAndUpdate(filter, update, { new: true })
    .then((updatedDeck) => {
      // do something with the updated deck
      if (updatedDeck) {
        updatedDeck.save().then((savedDeck) => {
          res.json(savedDeck);
        });
      } else {
        res.json({ msg: "deck not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({
        error: err.message,
      });
    });
};



const remove = (req, res, next) => {
  const { name, cardIndex } = req.body;

  Deck.findOne({ name: name, user: req.userInfo.username })
    .then((deck) => {
      if (deck) {
        deck.flashcards.splice(cardIndex, 1);
        deck.save().then((savedDeck) => {
          res.json(savedDeck);
        });
      } else {
        res.json({ msg: "deck not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        message: "error",
      });
    });
};

const decks = (req, res, next) => {
  const allDecks = [];
  Deck.find({ user: req.userInfo.username })
    .then((decks) => {
      decks.forEach(deck => {
        const flashcards = deck.flashcards;

        console.log(flashcards);
        let currentTime = Date.now();
        let cardsIntroduced = 0;
        let reviewCount = 0;
        let learningCount = 0;
        let newCount = 0;
        if (!deck.last_introduction || ((currentTime - deck.last_introduction) >= 86400000)) {
          console.log('new day')
          deck.last_introduction = currentTime;
        }
        else {
          cardsIntroduced = deck.cards_introduced_today;
        }
        console.log('cards introduced before: ' + cardsIntroduced)
        flashcards.forEach((card) => {
          const reviewed_time = Date.parse(card.reviewed_time);
          const next_review = card.next_review;
          const reviews = card.reviews;
          const difficulty = card.difficulty;
  
          const time_until_review = next_review + reviewed_time - currentTime;
          console.log(time_until_review);

          if (!card.active && (cardsIntroduced < cardsPerDay)) {
            card.active = true;
            cardsIntroduced++;
          }
          if (card.active) {
            if (reviews <= 3 && (difficulty === 'Hard' || difficulty === 'Very Hard')) {
              learningCount ++;
            }
  
            else if (difficulty == 'New') {
              newCount ++;
            }

            else {
              reviewCount++;
            }
          }

        });
        deck.cards_introduced_today = cardsIntroduced;
        deck.save()
        .then(savedDeck => {
          console.log(savedDeck)
          console.log(savedDeck);
        })
        console.log()
        const newObj = {
          ...deck.toObject(),
          to_review: reviewCount,
          learning: learningCount,
          new: newCount,
        }
        allDecks.push(newObj)
      })
      return res.json(allDecks);
    })
    .catch((err) => {
      console.log(err)
      res.json({
        message: "error getting decks please try again",
      });
    });
};

const to_review = (req, res) => {
  const name = req.query.deck;
  Deck.findOne({ name: name, user: req.userInfo.username }).then((deck) => {
    if (deck) {
      const flashcards = deck.flashcards;
      console.log(flashcards);
      currentTime = Date.now();
      let cards_to_review = [];
      let currentIndex = 0;
      flashcards.forEach((card) => {
        const reviewed_time = Date.parse(card.reviewed_time);
        const next_review = card.next_review;

        const time_until_review = next_review + reviewed_time - currentTime;
        console.log(time_until_review);
        // Create a new JavaScript object based on the MongoDB document
        let cardCopy = {
          ...card.toObject(), // Convert the MongoDB document to a plain JavaScript object
          cardIndex: currentIndex, // Add the cardIndex property
        };

        // Now you can use cardCopy with the added cardIndex property
        // Increment currentIndex for the next cardCopy if needed
        currentIndex++;

        if (time_until_review <= 0 && card.active) {
          cards_to_review.push(cardCopy);
        }
      });
      res.json(cards_to_review);
    } else {
      res.json({ msg: "deck not found" });
    }
  });
};

const next_card_time = (req, res) => {
  const name = req.query.deck;
  Deck.findOne({ name: name, user: req.userInfo.username }).then((deck) => {
    if (deck) {
      const flashcards = deck.flashcards;
      // If no cards to review, find the time until the next card is ready
      let nextCardTime = Infinity;
      const currentTime = Date.now(); // Get current time
      const dateObj = new Date();
      console.log("date");
      console.log(dateObj);

      flashcards.forEach((card) => {
        const reviewed_time = Date.parse(card.reviewed_time);
        console.log(card);
        console.log(card.next_review);
        const next_review = card.next_review;
        console.log(currentTime + " " + reviewed_time + " " + next_review);

        const time_until_review = next_review + reviewed_time - currentTime;
        console.log("time until review", time_until_review);

        if (time_until_review < nextCardTime) {
          nextCardTime = time_until_review;
        }
      });

      console.log("Next card time:", nextCardTime);

      res.json({
        time_until_next_card: convertMilliseconds(nextCardTime),
        simplified_time: convertMillisecondsToTime(nextCardTime),
      });
    } else {
      res.json({ msg: "deck not found" });
    }
  });
};

const answer = (req, res) => {
  const { name, cardIndex, difficulty } = req.body;
  console.log(difficulty);
  function getDiffMultiplier(diff) {
    console.log(diff);
    const EASY_FACTOR = 2.5;
    const GOOD_FACTOR = 1.8;
    const NEW_FACTOR = 1.5;
    const HARD_FACTOR = 1.2;
    const VERY_HARD_FACTOR = 1.0;

    let multiplier;
    if (diff == "New") {
      multiplier = NEW_FACTOR;
    } else if (diff == "Easy") {
      multiplier = EASY_FACTOR;
    } else if (diff == "Good") {
      multiplier = GOOD_FACTOR;
    } else if (diff == "Hard") {
      multiplier = HARD_FACTOR;
    } else if (diff == "Very Hard") {
      multiplier = VERY_HARD_FACTOR;
    } else {
      multiplier = GOOD_FACTOR;
    }

    return multiplier;
  }

  Deck.findOne({ name: name, user: req.userInfo.username }).then((deck) => {
    if (deck) {
      const card = deck.flashcards[cardIndex];
      const multiplier1 = getDiffMultiplier(difficulty);
      const multiplier2 = getDiffMultiplier(card.difficulty);

      let time_to_wait =
        (multiplier1 * multiplier2) ** 2 *
          (card.reviews + 1) ** 1.75 *
          1000 ** 2 +
        300000; // 5 min smallest
      const stoppingLim = 5097600000; // 2 months in milliseconds

      if (time_to_wait > stoppingLim) {
        time_to_wait = stoppingLim;
      }

      // Example usage
      let duration = convertMilliseconds(time_to_wait);
      console.log(duration);

      console.log(time_to_wait);

      // update deck database
      const dateObj = new Date();

      deck.flashcards[cardIndex].reviews = card.reviews + 1;
      deck.flashcards[cardIndex].next_review = time_to_wait;
      deck.flashcards[cardIndex].difficulty = difficulty;
      deck.flashcards[cardIndex].wait_time = duration;
      deck.flashcards[cardIndex].reviewed_time = dateObj;

      deck.save().then((savedDeck) => {
        console.log(savedDeck);
        res.json(savedDeck);
      });
    } else {
      res.json({ msg: "deck not found" });
    }
  });
};

module.exports = {
  // creating decks and flashcards and editing and deleting cards
  create,
  add,
  bulk_add,

  edit,
  remove,

  // getting decks
  decks,
  to_review,
  next_card_time,

  answer,
};
