// public/js/delete-photo.js

document.addEventListener('DOMContentLoaded', function () {
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    deletePhotoBtn.addEventListener('click', function () {
      if (confirm('Are you sure you want to delete the photo?')) {
        const deleteForm = document.createElement('form');
        deleteForm.method = 'POST';
        deleteForm.action = '/admin/delete-photo';
        
        // Add a CSRF token if your app uses CSRF protection
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf'; // Change to your CSRF field name
        csrfInput.value = 'csrfTokenValue'; // Replace with the actual CSRF token value
        deleteForm.appendChild(csrfInput);
        
        document.body.appendChild(deleteForm);
        deleteForm.submit();
      }
    });
  });
  