const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true, maxlength: 25 },
  page_count: { type: Number, required: true },
  letter_id: { type: Number, required: true },
  language_id: { type: Number, required: true },
  binding_id: { type: Number, required: true },
  format_id: { type: Number, required: true },
  publisher_id: { type: Number, required: true },
  ISBN: { type: String, maxlength: 15 },
  quantity_count: { type: Number, required: true },
  rented_count: { type: Number, required: true },
  reserved_count: { type: Number, required: true },
  body: { type: String, maxlength: 41 },
  year: { type: String, maxlength: 4 },
  pdf: { type: String, maxlength: 45 },
  placeholder: { type: Number, required: true }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
