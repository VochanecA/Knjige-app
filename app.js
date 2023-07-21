const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const mime = require('mime');
const models = require('./models/models');
const { Book, User, Author }= require('./models/models');
const session = require('express-session');


require('dotenv').config();

// Konektuj seMongoDB
mongoose.connect('mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Povezano sa MongoDB'))
  .catch(err => console.error('Greška pri konektovanju na MongoDB:', err));


// Podesi EJS
app.set('view engine', 'ejs');

// Setuj direktorijum za views
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('assets'));
app.use(express.static('assets', { "extensions": ["css"] }));

// Staticni fajlovi
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', mime.getType(filePath));
  }
}));


app.use(session({
  secret: '1234567890', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  clearExpired: true,
  cookie: { maxAge: 300000 } ,//  5 min u milisekundama
  resave: false, // 
  saveUninitialized: false 
}));


// Middleware da setuje loggedIn promjenljivu
app.use((req, res, next) => {
  req.loggedIn = req.session.username !== undefined;
  next();
});


// Prikazuje pocetnu stranicu
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

    // Get the logged-in user's username
    const username = req.user ? req.user.username : null;

    const users = await models.User.find();
    const books = await models.Book.find(query).exec();
    res.render('index', { loggedIn: req.loggedIn, username, users, books });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greška servera.');
  }
});

app.get('/dashboard', async (req, res) => {
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

    const username = req.session.username || null;
    
    // Fetch all authors from the database using your model (assuming your model is named "Author")
    const authors = await models.Author.find();

    // Fetch all books from the database based on the query
    const books = await models.Book.find(query).exec();

    // Render the dashboard.ejs template and pass the loggedIn, username, books, and authors variables
    res.render('dashboard', { loggedIn: req.loggedIn, username, books, authors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});





// Prikazuje formu za kreiranje novog korisnika
app.get('/users/new', (req, res) => {
  res.render('new-user');
});

// Dodaje novog korisnika
app.post('/users', async (req, res) => {
  try {
    const user = new models.User(req.body);
    await user.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Greška servera.');
  }
});

// Prikazuje formu za registraciju novog korisnika
// Kreira novog korisnika
app.post('/signup', async (req, res) => {
  try {
    const {
      id,
      user_type_id,
      user_gender_id,
      name,
      JMBG,
      email,
      username,
      email_verified_at,
      password,
      photo,
      remember_token,
      last_login_at,
      login_count,
      created_at,
      updated_at,
      github,
      active
    } = req.body;

    const user = new User({
      id,
      user_type_id,
      user_gender_id,
      name,
      JMBG,
      email,
      username,
      email_verified_at,
      password,
      photo,
      remember_token,
      last_login_at,
      login_count,
      created_at,
      updated_at,
      github,
      active: active === 'true' // Cast to boolean
    });

    await user.save();
    res.redirect('/'); // Redirect to the desired page
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/login', (req, res) => {
  res.render('login'); // Assuming you have a "login.ejs" file in your views directory
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { uname, psw } = req.body;

    // vidi postoji i user u bazi
    const user = await User.findOne({ username: uname });

    if (user) {
      // User vec postoji
      if (user.password === psw) {
        // Password se poklapa
        const welcomeMessage = `Welcome, ${user.username}!`;
        req.session.username = user.username;
        return res.send(`<script>alert("${welcomeMessage}"); window.location.href="/dashboard";</script>`);
        return res.render('dashboard', { username: user.username });
      }
    }

    // nije se poklopilo
    res.render('login', { error: 'Pogresan user ili password' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server greska');
  }
});

// Logout ruta
app.get('/logout', (req, res) => {
  res.render('logout');
});

// Handlovanje logout zahtjeva (da unisti sesiju)
app.post('/logout', (req, res) => {
  // unisti sesiju
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.redirect('/');
  });
});

// Prikazuje formu za uređivanje knjige
app.get('/books/:id/edit', async (req, res) => {
  try {
    const book = await Book.findOne({ id: req.params.id }).populate('author');
    const authors = await Author.find({}, 'NameSurname');

    if (!book) {
      return res.status(404).send('Knjiga nije pronađena');
    }

    res.render('edit-book', { book, authors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greška servera');
  }
});


app.post('/books/:id', async (req, res) => {
  try {
    const book = await models.Book.findOne({ id: req.params.id });
    if (!book) {
      return res.status(404).send('Knjiga nije nadjenaa');
    }

    
    console.log('Primljeni podaci za kontrolu:', req.body);

   
    book.title = req.body.title;
    book.page_count = req.body.page_count;
    book.ISBN = req.body.isbn;
    book.quantity_count = req.body.quantity_count;
    book.body = req.body.body;

    
    console.log('Updateovana knjiga:', book);

   
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
      return res.status(404).send('Knjiga nije nadjena');
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
      return res.status(404).send('Knjiga nije nadjena');
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
    res.render('autor', { authors, loggedIn: req.loggedIn });
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera.');
  }
});


app.get('/authors/new', (req, res) => {
  res.render('new-author');
});

const removeBookFromCart = (req, bookId) => {
  return new Promise((resolve, reject) => {
    req.session.shoppingCart = req.session.shoppingCart || [];


    const indexToRemove = req.session.shoppingCart.findIndex(book => book._id.equals(bookId));

    if (indexToRemove !== -1) {
      req.session.shoppingCart.splice(indexToRemove, 1);
    }

    req.session.save(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


app.post('/remove-from-cart/:id', (req, res) => {
  const bookId = req.params.id;
  removeBookFromCart(req, bookId)
    .then(() => {
      const cartCount = req.session.shoppingCart.length;
      res.json({ message: 'Book removed from cart', count: cartCount });
    })
    .catch(err => {
      console.error('Error occurred while removing book from cart:', err);
      res.status(500).send('Server error');
    });
});








app.post('/add-to-cart/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await models.Book.findOne({ id: bookId });

    if (!book) {
      return res.status(404).send('Knjiga nije nadjena');
    }

  
    if (!req.session.username) {
      return res.status(401).send('User not found');
    }


    const user = await models.User.findOne({ username: req.session.username });

    if (!user) {
      return res.status(401).send('User not found');
    }

    user.shoppingCart.push(book);
    await user.save();

    
    const cartCount = user.shoppingCart.length;
    res.json({ message: 'Book added to cart', count: cartCount });
  } catch (err) {
    console.error('Error occurred while adding book to cart:', err);
    res.status(500).send('Server error');
  }
});



app.get('/shopping-cart', async (req, res) => {
  try {
    // nadji logovanog usera
    const user = await models.User.findOne({ username: req.session.username }).populate('shoppingCart');
    if (!user) {
      return res.status(401).send('Korisnik nije nadjena');
    }

    // prikazi shopping cart sa korisnickim knjigama
    res.render('shopping-cart', { shoppingCart: user.shoppingCart });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/get-cart-count', (req, res) => {
  const cartCount = req.session.shoppingCart ? req.session.shoppingCart.length : 0;
  res.json({ count: cartCount });
});








// Handler to display the shopping cart and proceed to checkout
app.get('/checkout', (req, res) => {
  try {
    const shoppingCart = req.session.shoppingCart || [];

    res.render('checkout', { shoppingCart });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/checkout', (req, res) => {
  try {
    const shoppingCart = req.session.shoppingCart || [];

    res.render('checkout', { shoppingCart });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
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
