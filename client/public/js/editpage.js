let currentIndex = 0;

function displayCards(deck) {
    console.log('get cards')
    const data = {
        name: deck
    }

    fetch(`/api/deck?deck=${deck}`, {
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
            displayNoCards();
        }
        const cards = data.flashcards;

        const totalQuestions = document.getElementById('total-questions');
        totalQuestions.innerHTML = cards.length;
        const currentQuestionNumber = document.getElementById('current-question-number');
        if (cards.length >= 1) {
            currentQuestionNumber.innerHTML = 1;
        }
        else {
            currentQuestionNumber.innerHTML = 0;
        }

        zIndex = cards.length + 1000;

        const jumpInput = document.getElementById('jump-input');
        jumpInput.max = cards.length;

        cardIndex = 0;
        console.log(zIndex);
        cards.forEach(card => {
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

function displayNoCards() {
    console.log('No cards')
}

function addCardPopup() {
    console.log('no cards');
}

function flipCard(card) {
    card.classList.toggle('flip');
}

function nextCard() {
    const allCards = document.querySelectorAll('.card');
    const currentCard = allCards[currentIndex];
    currentCard.classList.remove('flip');

    if (currentIndex+1 < allCards.length) {
        const nextCard = allCards[currentIndex + 1];
        nextCard.classList.remove('hidden');
        currentCard.classList.add('slide');
        nextCard.classList.remove('slide');
        // currentCard.style.zIndex = (cardStack.length + 10) - currentIndex;
        //currentCard.classList.add('hidden');
        currentIndex++;
    }
    else {
        currentCard.classList.add('slide');
        currentIndex = 0;
        allCards.forEach(card => {
            card.classList.remove('hidden');
            card.classList.remove('slide');
        })
    }

    const currentQuestionNumber = document.getElementById('current-question-number');
    currentQuestionNumber.innerHTML = currentIndex+1;
}

function prevCard() {
    const allCards = document.querySelectorAll('.card');
    const currentCard = allCards[currentIndex];
    currentCard.classList.remove('flip');

    if (currentIndex > 0) {
        const prevCard = allCards[currentIndex - 1];
        prevCard.classList.remove('hidden');
        prevCard.classList.remove('slide');
        currentCard.classList.add('slide');
        // currentCard.style.zIndex = (cardStack.length + 10) - currentIndex;
        //currentCard.classList.add('hidden');
        currentIndex--;
    }
    else {
        currentCard.classList.add('slide');
        currentIndex = allCards.length-1;
        const newCurrentCard = allCards[currentIndex];
        newCurrentCard.classList.remove('hidden');
        newCurrentCard.classList.remove('slide');
    }

    const currentQuestionNumber = document.getElementById('current-question-number');
    currentQuestionNumber.innerHTML = currentIndex + 1;
}

function jumpTo(number) {
    const allCards = document.querySelectorAll('.card');

    if (number <= allCards.length) {
        const currentCard = allCards[currentIndex];
        currentCard.classList.remove('flip');
        currentCard.classList.add('slide')
        currentIndex = number -1;
        const newCurrentCard = allCards[currentIndex];
        newCurrentCard.classList.remove('hidden');
        newCurrentCard.classList.remove('slide');

        const currentQuestionNumber = document.getElementById('current-question-number');
        currentQuestionNumber.innerHTML = number;
    }
    else {
        alert('There is not a card at this index')
    }
}

function appendCard(card) {
    const allCards = document.querySelectorAll('.card');
    const cardContainer = document.querySelector('.cards-container');
    let zIndex = 1000;

    if (allCards.length > 0) {
        const lastCard = allCards[allCards.length - 1];
        // Get the computed style of the card
        const computedStyle = window.getComputedStyle(lastCard);

        // Read the z-index property
        zIndex = computedStyle.getPropertyValue('z-index') - 1;
    }

    console.log(zIndex);

    const cardObj = document.createElement('div');
    cardObj.className = 'card';
    cardObj.style.zIndex = zIndex;
    if (zIndex !== 1000) {
        cardObj.classList.add('hidden');
    }

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

    const totalQuestions = document.getElementById('total-questions');
    totalQuestions.innerHTML = allCards.length + 1;
}