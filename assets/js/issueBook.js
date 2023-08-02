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

  // Automatically fetch and display books from the selected author
  fetchBooksByAuthor(selectedAuthorId);
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

bookResults.addEventListener('click', (e) => {
  const selectedBookTitle = e.target.innerText.trim();
  bookTitleInput.value = selectedBookTitle;
  bookResults.innerHTML = '';
});

// Function to generate the list of authors
function generateAuthorList(authors) {
 return `<ul>${authors.map(author => `<li data-author-id="${author._id}">${author.name} ${author.surname}</li>`).join('')}</ul>`;
}

// Function to generate the list of books
function generateBookList(books) {
  return `<ul>${books.map(book => `<li>${book.title}</li>`).join('')}</ul>`;
}

// Function to fetch and display books from the selected author
async function fetchBooksByAuthor(authorId) {
  try {
    const response = await fetch(`/admin/books/author/${authorId}`);
    const data = await response.json();
    bookResults.innerHTML = generateBookList(data);
  } catch (err) {
    console.error('Error fetching books by author:', err);
  }
}
