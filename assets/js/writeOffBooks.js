// lakse je sa externim writeOffBooks.js zbog ".Refused to execute inline script because it violates the following Content Security Policy directive: "

document.addEventListener('DOMContentLoaded', () => {
    const writeOffBtn = document.getElementById('write-off-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedCheckboxes.length > 0) {
          writeOffBtn.disabled = false;
        } else {
          writeOffBtn.disabled = true;
        }
      });
    });
  
    cancelBtn.addEventListener('click', () => {
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      writeOffBtn.disabled = true;
    });
  });
  