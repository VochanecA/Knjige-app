const isbn = '<%= book.ISBN %>';
const googleBookInfoContainer = document.getElementById('google-book-info');

fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
  .then(response => response.json())
  .then(data => {
    if (data.items && data.items.length > 0) {
      const bookInfo = data.items[0].volumeInfo;
      googleBookInfoContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
    
    <img src="/path/to/google-logo.png" alt="Google Logo">
    <ul style="list-style: none; padding: 0;">
      <li><strong>Naslov:</strong> ${BookInfo.title}</li>
      <li><strong>Autori:</strong> ${BookInfo.authors.join(', ')}</li>
      <li><strong>Izdavač:</strong> ${BookInfo.publisher}</li>
      <li><strong>Broj stranica:</strong> ${BookInfo.pageCount}</li>
      <li><strong>Godina izdanja:</strong> ${BookInfo.publishedDate}</li>
      <li><strong>Kategorije:</strong> ${BookInfo.categories.join(', ')}</li>
    </ul>
  </div>
`;
    } else {
      googleBookInfoContainer.innerHTML = '<p>Nema dostupnih informacija o knjizi iz Google Books.</p>';
    }
  })
  .catch(error => {
    console.error('Greska prilikom skidanaj podataka sa Google API:', error);
    googleBookInfoContainer.innerHTML = '<p>Greška prilikom dohvata informacija iz Google Books.</p>';
  });
