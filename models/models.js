const mongoose = require('mongoose');

// User Model
const User = mongoose.model('User', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  user_type_id: { type: Number, required: true },
  user_gender_id: { type: Number, required: true },
  name: { type: String, required: true, maxlength: 15 },
  JMBG: { type: String, required: true, maxlength: 15 },
  email: { type: String, required: true, maxlength: 45 },
  username: { type: String, required: true, maxlength: 45 },
  email_verified_at: { type: Date },
  password: { type: String, required: true, maxlength: 25 },
  photo: { type: String, maxlength: 200 },
  remember_token: { type: String, maxlength: 100 },
  last_login_at: { type: Date },
  login_count: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  github: { type: String },
  active: { type: Boolean }
}));

// Book Model
const Book = mongoose.model('Book', new mongoose.Schema({
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
}));

// Reservation Model
const Reservation = mongoose.model('Reservation', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  reservationMadeFor_user_id: { type: Number, required: true },
  reservationMadeBy_user_id: { type: Number, required: true },
  closeReservation_user_id: { type: Number, required: true },
  closure_reason: { type: Number, required: true },
  requested_date: { type: Date },
  reservation_date: { type: Date },
  close_date: { type: Date }
}));

// StatusReservation Model
const StatusReservation = mongoose.model('StatusReservation', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  status: { type: String, required: true, maxlength: 25 }
}));

// Gallery Model
const Gallery = mongoose.model('Gallery', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  photo: { type: String, maxlength: 254 },
  cover: { type: Number, required: true }
}));

// BookAuthor Model
const BookAuthor = mongoose.model('BookAuthor', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true }
}));

// BookCategory Model
const BookCategory = mongoose.model('BookCategory', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  category_id: { type: Number, required: true }
}));

// BookGenre Model
const BookGenre = mongoose.model('BookGenre', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  genre_id: { type: Number, required: true }
}));

// Author Model
const Author = mongoose.model('Author', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_author_id: { type: Number, required: true },
  NameSurname: { type: String, maxlength: 100 },
  photo: { type: String, maxlength: 200 },
  biography: { type: String, maxlength: 1000 },
  wikipedia: { type: String, maxlength: 200 },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true }
}));

module.exports = {
  User,
  Book,
  Reservation,
  StatusReservation,
  Gallery,
  BookAuthor,
  BookCategory,
  BookGenre,
  Author,
};
