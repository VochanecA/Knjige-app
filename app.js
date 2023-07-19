const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const mime = require('mime');
const models = require('./models/models');
const { Book, Author }= require('./models/models');
require('dotenv').config();

// Konektuj seMongoDB
mongoose.connect('mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// Podesi EJS
app.set('view engine', 'ejs');

// Setuj views direktorijum
app.set('views', path.join(__dirname, 'views'));

// Middleware je tu
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

    const users = await models.User.find();
    const books = await models.Book.find(query).exec();
    res.render('index', { users, books });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera.');
  }
});

app.get('/users/new', (req, res) => {
  res.render('new-user');
});

app.post('/users', async (req, res) => {
  try {
    const user = new models.User(req.body);
    await user.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera.');
  }
});

app.get('/books/:id/edit', async (req, res) => {
  try {
    const book = await Book.findOne({ id: req.params.id }).populate('author');
    const authors = await Author.find({}, 'NameSurname');

    if (!book) {
      return res.status(404).send('Book not found');
    }

    res.render('edit-book', { book, authors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera');
  }
});


app.post('/books/:id', async (req, res) => {
  try {
    const book = await models.Book.findOne({ id: req.params.id });
    if (!book) {
      return res.status(404).send('Book not found');
    }

    // Log the received data
    console.log('Received data:', req.body);

    // Update the book with the data from the form
    book.title = req.body.title;
    book.page_count = req.body.page_count;
    book.ISBN = req.body.isbn;
    book.quantity_count = req.body.quantity_count;
    book.body = req.body.body;

    // Log the updated book object
    console.log('Updated book:', book);

    // Save the book
    await book.save();

    res.redirect('/books/' + book.id);
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera');
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
    const book = new models.Book(req.body);
    await book.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera.');
  }
});
app.get('/books/:id/edit', async (req, res) => {
  try {
    const book = await Book.findOne({ id: req.params.id }).populate('author');
    const authors = await Author.find({}, 'NameSurname'); // Retrieve all authors with only the NameSurname field

    if (!book) {
      return res.status(404).send('Book not found');
    }

    res.render('edit-book', { book, authors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera');
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const book = await models.Book.findOne({ id: req.params.id });
    if (!book) {
      return res.status(404).send('Book not found');
    }
    res.render('book-details', { book });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera.');
  }
});
app.get('/authors', async (req, res) => {
  try {
    const authors = await models.Author.find();
    res.render('autor', { authors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera.');
  }
});

app.get('/authors/new', (req, res) => {
  res.render('new-author');
});




app.post('/authors', async (req, res) => {
  try {
    const {
      book_author_id,
      NameSurname,
      photo,
      biography,
      wikipedia,
      created_at,
      updated_at
    } = req.body;

    const author = new Author({
      _id: mongoose.Types.ObjectId(),
      book_author_id,
      NameSurname,
      photo,
      biography,
      wikipedia,
      created_at,
      updated_at
    });

    await author.save();
    res.redirect('/books/:id/edit'); // Redirekcija anzada na edit stranu
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera.');
  }
});


// Pokreni serverconst port = process.env.PORT || 3000;
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
