function updateBookDetails() {
  const selectedBookId = document.getElementById("book").value;
  const selectedBook = booksData.find(book => book._id === selectedBookId);
  console.log("Selected book:", selectedBook);

  if (selectedBook) {
    console.log("ISBN:", selectedBook.ISBN);
    document.getElementById("isbn").value = selectedBook.ISBN ? selectedBook.ISBN.toString() : "";
    document.getElementById("author").value = selectedBook.authors;
    // Add other fields update as needed
  } else {
    // Clear the fields if no book is selected
    document.getElementById("isbn").value = "";
    document.getElementById("author").value = "";
  }
}