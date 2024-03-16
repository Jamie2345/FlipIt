let difficultyBtnsActive = false;
let cardStack = []
let currentIndex = 0;

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

function adjustFontSize(card, frontText, backText) {
    console.log('adjustFontSize')
    // Get the width of the card
    var cardWidth = 300;
    var cardHeight = 600;
    console.log(cardWidth);

    // Get the length of the text on both sides
    var frontTextLength = frontText.textContent.length;
    var backTextLength = backText.textContent.length;

    console.log(frontTextLength);
    var cardArea = cardWidth + cardHeight;  // I know area is b*h so this isn't entirely true but it works
    console.log(cardArea);
    
    // Calculate the font size based on the longer text and card width
    var frontSize = Math.floor(cardArea / frontTextLength);
    var backSize = Math.floor(cardArea / backTextLength);
    // Apply the calculated font size to both sides
    frontText.style.fontSize = frontSize + "px";
    backText.style.fontSize = backSize + "px";
}

function displayDifficultyBtns() {
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
    currentCard.style.zIndex = currentIndex + 10 + 1;
    //currentCard.classList.add('hidden');
    currentIndex++;
}