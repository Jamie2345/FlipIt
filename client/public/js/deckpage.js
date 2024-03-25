document.addEventListener('DOMContentLoaded', () => {
    console.log('loaded')
    fetch(`/api/deck?deck=${DECKNAME}`, {
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
        const newObj = document.getElementById('new-cards')
        const learningObj = document.getElementById('learning-cards');
        const dueObj = document.getElementById('due-cards');

        newObj.innerHTML = data.new;
        learningObj.innerHTML = data.learning;
        dueObj.innerHTML = data.to_review;
        console.log(data);
    })
});