const path = window.location.pathname;
const items = document.querySelectorAll("#sidebar-nav a");
const activeItem = [].slice.call(items).find(item => item.getAttribute("href") == path);
if(activeItem) {
	activeItem.classList.add("active");
}

window.setTimeout(() => {
	let alertsWrapper = document.querySelector(".alerts-wrapper");
	if(alertsWrapper) {
		alertsWrapper.style.display = "none";
	}
}, 5000);

let btn = document.querySelector("#sidebar-toggler-btn");
if(btn = document.querySelector("#sidebar-toggler-btn")) {
	btn.addEventListener("click", () => {
		document.querySelector("#sidebar").classList.toggle("sidebar-hide");
	});
}

document.addEventListener('DOMContentLoaded', function() {
  var deleteButtons = document.querySelectorAll('.btn-delete');
  
  if (deleteButtons) {
    deleteButtons.forEach(function(button) {
      button.addEventListener("click", function() {
        var bookId = button.getAttribute("data-bookid");
        confirmDelete(bookId);
      });
    });
  }
});

function confirmDelete(bookId) {
  if (confirm("Jeste li sigurni da želite da obrišete knjigu?")) {
    document.getElementById(`hidden-form-${bookId}`).submit();
  }
}
