// public/js/bookDetails.js

document.addEventListener("DOMContentLoaded", () => {
  const selectBook = document.getElementById("book");
  if (selectBook) {
    selectBook.addEventListener("change", updateBookDetails);
  }
});

async function updateBookDetails() {
  const selectedBookId = document.getElementById("book").value;
  try {
    const response = await fetch(`/api/books/${selectedBookId}`);
    const selectedBook = await response.json();

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
  } catch (error) {
    console.error("Error fetching book details:", error);
  }
}
