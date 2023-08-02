function confirmDelete(id) {
  if (window.confirm("Are you sure you want to delete this book?\nAll the records related to this book will get deleted...")) {
    document.querySelector(`#hidden-form-${id}`).submit();
  }
}

$(document).ready(function () {
  $('#searchForm').submit(function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = $(this);
    const url = form.attr('action');
    const query = form.find('input[name="q"]').val();

    // Perform the AJAX request to the search-books route
    $.ajax({
      url: `/admin/books/search-books?q=${query}`, // Modified URL to match the search-books route
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        // Handle the JSON data and update the books table body
        const tbody = $('#books-table tbody');
        tbody.empty();
        if (data.length === 0) {
          tbody.html('<tr><td colspan="8">Nije pronadjena niti jedna knjiga.</td></tr>');
        } else {
          let html = '';
          data.forEach((book) => {
            html += `<tr>
              <td>${book.title}</td>
              <td>${book.authors}</td>
              <td>${book.category}</td>
              <td>${book.ISBN}</td>
              <td>${book.copiesOwned}</td>
              <td>${book.stock}</td>
              <td>${book.description}</td>
              <td>
                <a href="/admin/book/${book._id}" class="btn">Promjeni (Edituj)</a>
                <form class="d-none" id="hidden-form-${book._id}" action="/admin/book/${book._id}?_method=DELETE" method="POST">
                  <input type="submit">
                </form>
                <button onclick="confirmDelete('${book._id}')" class="btn">Obrisi</button>
              </td>
            </tr>`;
          });
          tbody.html(html);
        }
      },
      error: function (xhr, status, error) {
        console.error(error);
        const tbody = $('#books-table tbody');
        tbody.html('<tr><td colspan="8">Error occurred during search.</td></tr>');
      },
    });
  });
});
