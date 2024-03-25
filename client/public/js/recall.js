let difficultyBtnsActive = false;
let cardStack = []
let currentIndex = 0;

function convertMillisecondsToTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
  
    if (months >= 1) {
      return months + " m";
    } else if (days >= 1) {
      return days + " d";
    } else if (hours >= 1) {
      return hours + " h";
    } else if (minutes >= 1) {
      return minutes + " m";
    } else {
      return seconds + " s";
    }
}

function calculateWaitTime(difficulty1, difficulty2, reviews) {
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

    const multiplier1 = getDiffMultiplier(difficulty1);
    const multiplier2 = getDiffMultiplier(difficulty2);

    let time_to_wait =
    (multiplier1 * multiplier2) ** 2 *
        (reviews + 1) ** 1.75 *
        1000 ** 2 +
    300000; // 5 min smallest
    const stoppingLim = 5097600000; // 2 months in milliseconds

    if (time_to_wait > stoppingLim) {
        time_to_wait = stoppingLim;
    }
    console.log('time to wait: ' + time_to_wait)
    return time_to_wait;
}

function displayNextCardTime(deck) {
    fetch(`/api/nearest_card_time?deck=${deck}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // include cookies
    })
    .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const time = data.simplified_time
        const cardContainer = document.querySelector('.cards-container');
        const timeToWaitMsg = document.createElement('p');
        timeToWaitMsg.innerHTML = `The next card will become available in ${time}`;
        cardContainer.appendChild(timeToWaitMsg);
    })
}

function getCards(deck) {
    console.log('get cards')
    const data = {
        name: deck
    }

    fetch(`/api/review?deck=${deck}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // include cookies
    })
    .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response (e.g., get and use the access token)
        console.log(data);
        const cardContainer = document.querySelector('.cards-container');
        if (data.length <= 0) {
            displayNextCardTime(deck)
        }
        cardStack = data;
        zIndex = data.length + 10;
        cardIndex = 0;
        console.log(zIndex);
        data.forEach(card => {
            const cardObj = document.createElement('div');
            cardObj.className = 'card';
            cardObj.style.zIndex = zIndex;
            zIndex--;
            if (cardIndex !== 0) {
                cardObj.classList.add('hidden');
            }
            cardIndex ++;
        
            cardObj.addEventListener('click', () => {
                flipCard(cardObj);
            })

            const front = document.createElement('div');
            front.className = 'front';

            const back = document.createElement('div');
            back.className = 'back';

            front.innerHTML = card.question;
            back.innerHTML = card.answer;

            //adjustFontSize(cardObj, front, back);

            cardObj.appendChild(front);
            cardObj.appendChild(back);

            cardContainer.appendChild(cardObj);
        })
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function flipCard(card) {
    card.classList.toggle('flip');
    if (!difficultyBtnsActive) {
        difficultyBtnsActive = true;
        displayDifficultyBtns();
    }
}

function displayDifficultyBtns() {
    const currentCard = cardStack[currentIndex];
    const difficulty = currentCard.difficulty;
    const reviews = currentCard.reviews

    const easyTimeMilliseconds = calculateWaitTime(difficulty, 'Easy', reviews);
    const goodTimeMilliseconds = calculateWaitTime(difficulty, 'Good', reviews);
    const hardTimeMilliseconds = calculateWaitTime(difficulty, 'Hard', reviews);
    const veryHardTimeMilliseconds = calculateWaitTime(difficulty, 'Very Hard', reviews);

    const easyTime = convertMillisecondsToTime(easyTimeMilliseconds);
    const goodTime = convertMillisecondsToTime(goodTimeMilliseconds);
    const hardTime = convertMillisecondsToTime(hardTimeMilliseconds);
    const veryHardTime = convertMillisecondsToTime(veryHardTimeMilliseconds);   

    const easyWaitObj = document.getElementById('easy-wait');
    const goodWaitObj = document.getElementById('good-wait');
    const hardWaitObj = document.getElementById('hard-wait');
    const veryHardWaitObj = document.getElementById('very-hard-wait');

    easyWaitObj.innerHTML = easyTime;
    goodWaitObj.innerHTML = goodTime;
    hardWaitObj.innerHTML = hardTime;
    veryHardWaitObj.innerHTML = veryHardTime;

    console.log(easyTime, goodTime, hardTime, veryHardTime);

    console.log(currentCard)
    const btnsContainer = document.querySelector('.difficulty-btns');
    btnsContainer.style.display = 'flex';
}

function hideDifficultyBtns() {
    const btnsContainer = document.querySelector('.difficulty-btns');
    btnsContainer.style.display = 'none';
    difficultyBtnsActive = false;
}

function submitDifficulty(btn) {
    const difficulty = btn.innerHTML
    const index = cardStack[currentIndex].cardIndex;
    console.log(index, difficulty)
    const data = {
        'name': DECKNAME,
        'cardIndex': index,
        'difficulty': difficulty
    }
    console.log(data)

    fetch('/api/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include' // include cookies
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response (e.g., get and use the access token)
        console.log(data);
    })
    nextCard();
}

function nextCard() {
    const allCards = document.querySelectorAll('.card');
    const currentCard = allCards[currentIndex];
    currentCard.classList.remove('flip');

    hideDifficultyBtns()

    if (currentIndex+1 >= cardStack.length) {
        console.log('last card')
        const completeMsg = document.createElement('h1');
        completeMsg.class = 'complete-msg';
        completeMsg.innerHTML = 'Deck Complete';
        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.appendChild(completeMsg);
        setTimeout(function() {
            window.location.reload();
        }, 3000);
    }
    else {
        const nextCard = allCards[currentIndex + 1];
        nextCard.classList.remove('hidden');
    }
    currentCard.classList.add('slide');
    // currentCard.style.zIndex = (cardStack.length + 10) - currentIndex;
    //currentCard.classList.add('hidden');
    currentIndex++;
}