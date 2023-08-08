const authorInput = document.querySelector('#author');
const authorResults = document.querySelector('#author-results');

const bookTitleInput = document.querySelector('#bookTitle');
const bookResults = document.querySelector('#book-results');

let selectedAuthorId = null;

authorInput.addEventListener('input', async (e) => {
  const query = e.target.value;
  if (query.length < 3) {
    authorResults.innerHTML = '';
    return;
  }
  const response = await fetch(`/admin/authors/search?query=${query}`);
  const data = await response.json();
  authorResults.innerHTML = generateAuthorList(data);
});

authorResults.addEventListener('click', (e) => {
  const selectedAuthorName = e.target.innerText.trim();
  const selectedAuthorIdAttr = e.target.getAttribute('data-author-id');
  authorInput.value = selectedAuthorName;
  selectedAuthorId = selectedAuthorIdAttr;
  authorResults.innerHTML = '';

  fetchBooksByAuthor(selectedAuthorName);
});

bookTitleInput.addEventListener('input', async (e) => {
  const query = e.target.value;
  if (query.length < 3) {
    bookResults.innerHTML = '';
    return;
  }
  const response = await fetch(`/admin/books/search?query=${query}`);
  const data = await response.json();
  bookResults.innerHTML = generateBookList(data);
});

bookResults.addEventListener('click', async (e) => {
  const selectedBookTitle = e.target.innerText.trim();
  bookTitleInput.value = selectedBookTitle;
  bookResults.innerHTML = '';

  // Fetch the ISBN by book title
  try {
    const response = await fetch(`/admin/books/isbn/${encodeURIComponent(selectedBookTitle)}`);
    if (response.ok) {
      const data = await response.json();
      const isbnInput = document.querySelector('#ISBN');
      isbnInput.value = data.isbn; // Fill the ISBN input field
    } else {
      console.error('Failed to fetch ISBN');
    }
  } catch (err) {
    console.error('Error fetching ISBN:', err);
  }
});

// Rest of your code for generating author/book lists and fetching books by author

function generateAuthorList(authors) {
  return `<ul>${authors.map(author => `<li data-author-id="${author._id}">${author.name} ${author.surname}</li>`).join('')}</ul>`;
}

function generateBookList(books) {
  return `<ul>${books.map(book => `<li>${book.title}</li>`).join('')}</ul>`;
}

async function fetchBooksByAuthor(authorName) {
  console.log('Fetching books for author:', authorName);
  try {
    const response = await fetch(`/admin/books/author/${encodeURIComponent(authorName)}`);
    const data = await response.json();
    console.log('Fetched books:', data);
    bookResults.innerHTML = generateBookList(data);
  } catch (err) {
    console.error('Error fetching books by author:', err);
  }
}
