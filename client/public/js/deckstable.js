function displayDecks() {
  fetch('/api/decks', {
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
      const decks = data;
      const decksTableBody = document.getElementById('table-body');
      decks.forEach(deck => {
        const name = deck.name
        const review_link = `/deck/${name}`
        const learning = deck.learning
        const new_cards = deck.new
        const due = deck.to_review

        const newRow = `
        <tr>
          <td class="left-align"><a href="${review_link}">${name}</a></td>
          <td class="new-cards">${new_cards}</td>
          <td class="learning-cards">${learning}</td>
          <td class="due-cards">${due}</td>
        </tr>
      `

        decksTableBody.innerHTML += newRow;
      })
  })
}