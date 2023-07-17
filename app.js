const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const mime = require('mime');

// Konektuj seMongoDB
mongoose.connect('mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

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
const BookAuthors = mongoose.model('BookAuthor', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  author_id: { type: Number, required: true }
}));

// bOOKCATEGORY Model
const BookCategories = mongoose.model('BookCategories', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  category_id: { type: Number, required: true }
}));

// BookGenre Model
const BookGenres = mongoose.model('BookGenres', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_id: { type: Number, required: true },
  genre_id: { type: Number, required: true }
}));

// Author Model
const Authors = mongoose.model('Authors', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  book_author_id: { type: Number, required: true }, // Relacija
  NameSurname: { type: String, maxlength: 100 },
  photo: { type: String, maxlength: 200 },
  biography: { type: String, maxlength: 1000 },
  wikipedia: { type: String, maxlength: 200 },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true }
}));

// Podesi EJS
app.set('view engine', 'ejs');

// SETUJ views direktorijum
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('assets'));
app.use(express.static('assets', { "extensions": ["css"] }));

// staticni fajlovi
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', mime.getType(filePath));
  }
}));

app.get('/', async (req, res) => {
  try {
    let query = {};
    const searchQuery = req.query.search;
    if (searchQuery) {
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { id: parseInt(searchQuery) || 0 },
          { page_count: parseInt(searchQuery) || 0 }
        ]
      };
    }

    const users = await User.find();
    const books = await Book.find(query).exec();
    res.render('index', { users, books });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/users/new', (req, res) => {
  res.render('new-user');
});

app.post('/users', async (req, res) => {
  try {
    const { id, user_type_id, user_gender_id, name, JMBG, email, username, email_verified_at, password, photo, remember_token, last_login_at, login_count, created_at, updated_at, github, active } = req.body;
    const user = new User({
      id: id || 0,
      user_type_id: user_type_id || 0,
      user_gender_id: user_gender_id || 0,
      name: name || '',
      JMBG: JMBG || '',
      email: email || '',
      username: username || '',
      email_verified_at: email_verified_at || null,
      password: password || '',
      photo: photo || '',
      remember_token: remember_token || '',
      last_login_at: last_login_at || null,
      login_count: login_count || 0,
      created_at: created_at || null,
      updated_at: updated_at || null,
      github: github || '',
      active: active || false
    });
    await user.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/books/new', (req, res) => {
  res.render('new-book');
});

app.get('/reservations/new', (req, res) => {
  res.render('new-reservation');
});

app.post('/books', async (req, res) => {
  try {
    const { id, title, page_count, letter_id, language_id, binding_id, format_id, publisher_id, ISBN, quantity_count, rented_count, reserved_count, body, year, pdf, placeholder } = req.body;
    const book = new Book({
      id: id || 0,
      title: title || '',
      page_count: page_count || 0,
      letter_id: letter_id || 0,
      language_id: language_id || 0,
      binding_id: binding_id || 0,
      format_id: format_id || 0,
      publisher_id: publisher_id || 0,
      ISBN: ISBN || '',
      quantity_count: quantity_count || 0,
      rented_count: rented_count || 0,
      reserved_count: reserved_count || 0,
      body: body || '',
      year: year || '',
      pdf: pdf || '',
      placeholder: placeholder || 0
    });

    await book.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ id: req.params.id });
    if (!book) {
      return res.status(404).send('Book not found');
    }
    res.render('book-details', { book });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/authors/new', (req, res) => {
  res.render('new-author');
});

app.post('/authors', async (req, res) => {
  try {
    const { id, book_author_id, NameSurname, photo, biography, wikipedia, created_at, updated_at } = req.body;
    const author = new Authors({
      id: id || 0,
      book_author_id: book_author_id || 0,
      NameSurname: NameSurname || '',
      photo: photo || '',
      biography: biography || '',
      wikipedia: wikipedia || '',
      created_at: created_at || null,
      updated_at: updated_at || null
    });

    await author.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Pokreni server
app.listen(3000, () => {
  console.log('Server startovan na portu 3000');
});
