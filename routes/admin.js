
//const compression = require('compression')
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Book = require("../models/book.js");
const Loan = require("../models/loan.js");
const Activity = require("../models/activity.js");
const Author = require('../models/author.js');
const Reservation  = require('../models/reservations.js');

const nodemailer = require("nodemailer");
//const upload = require("../middleware/multer");
const UserActivity = require('../models/UserActivity.js'); 
const mongoosePaginate = require('mongoose-paginate');
const Settings = require('../models/settings.js');
const multer = require("multer"); 
const bodyParser = require('body-parser');


const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	  cb(null, 'assets/users/images/'); // Change this to your desired destination
	},
	filename: (req, file, cb) => {
	  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
	  cb(null, uniqueSuffix + '-' + file.originalname);
	},
  });
  
  const upload = multer({ storage: storage });
  
  // Use bodyParser middleware
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  
	  await Loan.updateMany({ status: "izdata", dueTime: { $lt: new Date() } }, { status: "kasni" });
  
	
	  const numStudents = await User.countDocuments({ role: "korisnik" });
	  const numAdmins = await User.countDocuments({ role: "admin" });
  
	
	  const books = await Book.find();
	  const numDistinctBooks = books.length;
	  const numTotalBooks = books.reduce((total, book) => total + book.copiesOwned, 0);
   
	
	  const numBooksNotReturned = await Loan.countDocuments({ status: { $in: ["izdata", "kasni"] } });
  
	
	  const numBooksOverdue = await Loan.countDocuments({ status: "kasni" });
  

	  const activities = await Activity.find().populate("admin").populate("korisnik").populate("book").sort({ activityTime: -1 }).limit(10);

	
		const reservations = await Reservation.find()
		.populate("user") 
		.populate("book")
		.sort({ reservationDate: -1 })
		.limit(10);
  

		const { mostPopularBookTitle, mostPopularBookCount } = await calculateMostPopularBook();


		
	  res.render("admin/dashboard", {
		title: "Dashboard",
		numStudents,
		numAdmins,
		numDistinctBooks,
		numTotalBooks,
		numBooksNotReturned,
		numBooksOverdue,
		activities,
		reservations, 
		currentUser: req.user, 
		mostPopularBookTitle,
		mostPopularBookCount
	  });
	} catch (err) {
	  console.log(err);
	  req.flash("error", "Admin -Doslo je do greske na serveru.");
	  res.redirect("back");
	}
  });


  router.get("/admin/activities", middleware.ensureAdminLoggedIn, async (req, res) => {
    try {
        const activities = await Activity.find()
            .populate("admin")
            .populate("korisnik")
            .populate("book")
            .sort("-activityTime");

        // Fetch user data based on the currently logged-in user
        const userId = req.user._id;
        const user = await User.findById(userId); // Assuming you have the user ID stored in req.user

        res.render("admin/activities", {
            title: "Activities",
            activities,
            userPhoto: user ? user.photo : null,
            userName: user ? user.firstName + " " + user.lastName : "",
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Doslo je do greske na serveru.");
        res.redirect("back");
    }
});

router.get("/admin/students", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const students = await User.find({role:"korisnik"});
		res.render("admin/students", { title: "Students", students });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});
/* 
router.get("/admin/books", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		// console.log(req.query);
		const filterObj = {};
		const filter = req.query.filter;
		const sortString = req.query.sortBy;
		if(filter)
		{
			filterObj.title = new RegExp(filter.title, 'i');
			filterObj.authors = new RegExp(filter.authors, 'i');
			filterObj.category = new RegExp(filter.category, 'i');
			filterObj.copiesOwned = {$gte: 0};
			filterObj.stock = {$gte: 0};
			if(filter.minCopiesOwned)
				filterObj.copiesOwned.$gte = filter.minCopiesOwned;
			if(filter.maxCopiesOwned)
				filterObj.copiesOwned.$lte = filter.maxCopiesOwned;
			if(filter.minStock)
				filterObj.stock.$gte = filter.minStock;
			if(filter.maxStock)
				filterObj.stock.$lte = filter.maxStock;
		}
		
		// console.log(filterObj);
		const books = await Book.find(filterObj).sort(sortString);
		res.render("admin/books", { title: "Books", books });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
}); */



router.get("/admin/books", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const filterObj = {};
	  const filter = req.query.filter;
	  const sortString = req.query.sortBy;
  
	  if (filter) {
		filterObj.title = new RegExp(filter.title, "i");
		filterObj.authors = new RegExp(filter.authors, "i");
		filterObj.category = new RegExp(filter.category, "i");
		filterObj.copiesOwned = { $gte: 0 };
		filterObj.stock = { $gte: 0 };
  
		if (filter.minCopiesOwned) {
		  filterObj.copiesOwned.$gte = filter.minCopiesOwned;
		}
  
		if (filter.maxCopiesOwned) {
		  filterObj.copiesOwned.$lte = filter.maxCopiesOwned;
		}
  
		if (filter.minStock) {
		  filterObj.stock.$gte = filter.minStock;
		}
  
		if (filter.maxStock) {
		  filterObj.stock.$lte = filter.maxStock;
		}
  
		if (filter.bindings) {
	
		  filterObj.bindings = new RegExp(filter.bindings, "i");
		}
	  }
  
	  // 
	  const books = await Book.find(filterObj).where('status').ne('written-off').sort(sortString);
  
	  res.render("admin/books", { title: "Books", books });
	} catch (err) {
	  console.log(err);
	  req.flash("error", "Doslo je do greske na serveru.");
	  res.redirect("back");
	}
  });
  



router.get("/admin/books/add", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/addBook", { title: "Add Book" });
});

router.post("/admin/books/add", middleware.ensureAdminLoggedIn, upload.single("uploadImage"), async (req, res) => {
	try {
	  const book = req.body.book;
	  if (book.ISBN.toString().length !== 13) {
		req.flash("error", "ISBN broj mora biti duzine 13");
		return res.redirect("back");
	  }
  
	  // vidi je li nova slika uploadovana
	  if (req.file) {
		
		book.image = "/assets/users/images/" + req.file.filename;
	  }
  
	  book.stock = book.copiesOwned;
	  const newBook = new Book(book);
	  await newBook.save();
  
	  const newActivity = new Activity({
		category: "dodajknjigu",
		admin: req.user._id,
		book: newBook._id,
	  });
	  await newActivity.save();
  
	  req.flash("success", "Knjiga uspjesno dodata");
	  res.redirect("/admin/books");
	} catch (err) {
	  console.log(err);
	  req.flash("error", "Doslo je do greske na serveru.");
	  res.redirect("back");
	}
  });

router.get("/admin/book/:bookId", middleware.ensureAdminLoggedIn, async (req,res) => {
	const bookId = req.params.bookId;
	try
	{
		const book = await Book.findById(bookId);
		res.render("admin/updateBook", { title: "Update Book", book });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

router.put("/admin/book/:bookId", middleware.ensureAdminLoggedIn, async (req, res) => {
  const bookId = req.params.bookId;
  const updateObj = req.body.book;

  if (updateObj.ISBN.toString().length !== 13) {
    req.flash("error", "ISBN mora biti duzine 13");
    return res.redirect("back");
  }

  try {
    const prevObj = await Book.findById(bookId);

    // Ensure that the `authors` field contains an array of valid `ObjectId` references
    updateObj.authors = updateObj.authors.map(authorId => mongoose.Types.ObjectId(authorId));

    // Update the book using `findByIdAndUpdate` with `{ new: true }` option
    const updatedBook = await Book.findByIdAndUpdate(bookId, updateObj, { new: true });

    const diff = updateObj.copiesOwned - prevObj.copiesOwned;
    if (diff >= 0) {
      updatedBook.stock += diff;
      await updatedBook.save();
      // ... Rest of the code remains the same ...
    } else {
      // ... Rest of the code remains the same ...
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Doslo je do greske na serveru.");
    res.redirect("back");
  }
});

router.delete("/admin/book/:bookId", middleware.ensureAdminLoggedIn, async (req,res) => {
	const bookId = req.params.bookId;
	try
	{
		const book = await Book.findById(bookId);
		if(book.stock != book.copiesOwned)
		{
			req.flash("error", "Sve kopije knjige nisu dosle u biblioteku");
			return res.redirect("back");
		}
		await Book.findByIdAndDelete(bookId);
		await Loan.deleteMany({ book: bookId });
		await Activity.deleteMany({ book: bookId });
		req.flash("success", "Knjiga uspjesno obrisana!");
		res.redirect("/admin/books");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

//izdaj direktno
router.get("/admin/issueBookDirect", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { title, isbn, author } = req.query;
	res.render("admin/issueBookDirect", { title: "Izdaj knjigu", preFilledData: { title, isbn, author } });
  });
  
  

//izdaj knjigu
router.get("/admin/issue", middleware.ensureAdminLoggedIn, async (req,res) => {
	res.render("admin/issueBook", { title: "Izdaj knjigu" });
});

router.get("/admin/issue/:bookId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const bookId = req.params.bookId;

		res.render("admin/issueBook", { title: "Izdaj knjigu" });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

router.post("/admin/issue", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const email = req.body.email;
		const ISBN = req.body.ISBN;
		const student = await User.findOne({email, role: "korisnik"});
		if(!student)
		{
			req.flash("error", "Knjiga se ne može izdati.. Korisnik nije prijavljen");
			return res.redirect("back");
		}
		
		const book = await Book.findOne({ISBN});
		if(!book)
		{
			req.flash("error", "Knjiga se ne može izdati.. Knjiga sa datim ISBN nije pronađena");
			return res.redirect("back");
		}
		if(book.stock == 0)
		{
			req.flash("error", "Knjiga se ne može izdati.. Zaliha je 0");
			return res.redirect("back");
		}
		
		const newLoan = new Loan({ book: book._id, user: student._id, status: "izdata" });
		await newLoan.save();
		await Book.findByIdAndUpdate(book.id, { $inc: { stock: -1 } });
		
		const newActivity = new Activity({
			category: "izdaj",
			admin: req.user._id,
			student: student._id,
			book: book._id,
			loan: newLoan._id
		});
		await newActivity.save();
		
		req.flash("success", "Knjiga uspješno izdata");
		res.redirect("back");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});
//kraj izdavanja knjige

router.get("/admin/collectBook/:loanId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const loanId = req.params.loanId;
		const loan = await Loan.findById(loanId);
		loan.status = "vracena";
		loan.returnTime = Date.now();
		loan.save();
		await Book.findByIdAndUpdate(loan.book, { $inc: { stock: 1 } });
		
		const newActivity = new Activity({
			category: "vrati",
			admin: req.user._id,
			student: loan.user,
			book: loan.book,
			loan: loanId
		});
		await newActivity.save();
		
		req.flash("success", "Knjiga uspjesno vracena");
		res.redirect("/admin/loans/current");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

router.get("/admin/loans/current", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		await Loan.updateMany({ status: "izdata", dueTime: { $lt: new Date() } }, {status: "kasni"});
		const currentLoans = await Loan.find({ status: { $in: ["izdata", "kasni"] } }).populate("book").populate("user");
		res.render("admin/currentLoans", { title: "Current Loans", currentLoans });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

router.get("/admin/loans/previous", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const previousLoans = await Loan.find({ status: "vracena" }).populate("book").populate("user").sort("-returnTime");
		res.render("admin/previousLoans", { title: "Previous loans", previousLoans });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});
router.get('/admin/profile', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const userId = req.user._id;
	  const userActivities = await UserActivity.find({ userId }).sort({ loginTime: -1 });
	
	
	  const user = await User.findById(userId);
	
	  console.log(user); // 
	  
	  res.render('admin/profile', { userActivities, currentUser: req.user, userPhoto: user.photo, user });
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Error fetching login history');
	}
  });
  
  
  
  

  router.put("/admin/profile", middleware.ensureAdminLoggedIn, upload.single("photo"), async (req, res) => {
	try {
	  const id = req.user._id;
	  const updateObj = req.body.admin;
  
	  // Check if a new photo is uploaded
	  if (req.file) {
		const photoUrl = '/assets/users/images/' + req.file.filename; // Add a leading slash to the path

		updateObj.photo = photoUrl;
		
	  }
  
	  await User.findByIdAndUpdate(id, updateObj);
  
	  const newActivity = new Activity({
		category: "updateAdminProfile",
		admin: req.user._id,
	  });
	  await newActivity.save();
  
	  req.flash("success", "Ok.Profil uspješno ažuriran.");
	  res.redirect("/admin/profile");
	} catch (err) {
	  console.log(err);
	  req.flash("error", "Došlo je do greške na serveru.");
	  res.redirect("back");
	}
  });
  

router.get("/admin/emails/reminder", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const currentLoans = await Loan.find({ status: { $in: ["izdata", "kasni"] } }).populate("book").populate("user");
		
		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "test@gmail.com",
				pass: "test"
			}
		});
		
		for(let i=0; i<currentLoans.length; i++)
		{
			const email = currentLoans[i].user.email;
			const book = currentLoans[i].book.title;
			const dueTime = currentLoans[i].dueTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short"});
			
			await transport.sendMail({
				from: `Jednsotavna biblioteka<test@gmail.com>`,
				to: email,
				subject: "Podsjetnik za knjigu",
				text: "Postovani, morate vratiti knjigu",
				html: `<p>Vaša knjiga ${book} treba biti vraćena prije ${dueTime}</p>`
			});
			
		}
		
		req.flash("success", "Email uspjesno poslati.");
		res.redirect("/admin/loans/current");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

router.get('/admin/authors', async (req, res) => {
  try {
    const authors = await Author.find();
    res.render('admin/authors', { authors });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


//Autori
router.get("/admin/authors/add", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/addAuthor", { title: "Dodaj Autora" });
});


router.post('/admin/authors/add',  middleware.ensureAdminLoggedIn, async (req, res) => {
  const author = new Author(req.body.author);

  try {
    await author.save();
	req.flash("success", "Autor uspjesno dodat");
    res.redirect('/admin/authors');
  } catch (err) {
    console.error(err);
    res.render('/admin/addAuthor', { title: 'Dodaj novog autora', author });
  }
});

router.get('/admin/authors/edit/:id',  middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render('admin/editAuthor', { author });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST 
router.post('/admin/authors/edit/:id',  middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const { name, surname, biography, image } = req.body;
    await Author.findByIdAndUpdate(req.params.id, { name, surname, biography, image });
		req.flash("success", "Autor uspjesno update-ovan");
    res.redirect('/admin/authors');
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera');
  }
});

router.post('/admin/authors/delete/:id',  middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    await Author.findByIdAndDelete(req.params.id);
		req.flash("success", "Autor uspjesno obrisan");
    res.redirect('/admin/authors');
  } catch (err) {
    console.error(err);
    res.status(500).send('Greska servera');
  }
});
// kraj autora


//  trazenje autora--ne valja
router.get('/admin/authors/search', async (req, res) => {
  const query = req.query.query;

  try {
    // Use a regular expression to perform a case-insensitive search on the author name
    const regex = new RegExp(query, 'i');
    const authors = await Author.find({ name: regex });

    res.json(authors);
  } catch (err) {
    console.error('Error searching authors:', err);
    res.status(500).json({ error: 'Error searching authors' });
  }
});
//trazi knjige
router.get('/admin/books/search', async (req, res) => {
  const query = req.query.query; 

  try {
   
    const matchedBooks = await Book.find({
      author: { $regex: new RegExp(query, 'i') } // Pretraživanje bez obzira na velika i mala slova koristeći regularni izraz.
    }).exec();


    res.json(matchedBooks);
  } catch (err) {
    console.error('Greška pri traženju knjiga:', err);
    res.status(500).json({ error: 'Greska servera' });
  }
});

router.get('/admin/books/author/:authorName', async (req, res) => {
  const authorName = req.params.authorName;

  try {
    const matchedBooks = await Book.find({ authors: { $regex: new RegExp(authorName, 'i') } }).exec();
    res.json(matchedBooks);
  } catch (err) {
    console.error('Error searching for books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//trazi knjige
router.get('/admin/books/search-books', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const filterObj = {};

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      filterObj.$or = [
        { title: searchRegex },
        { authors: searchRegex },
        { category: searchRegex },
      ];
    }

    const books = await Book.find(filterObj);
    res.json(books);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Doslo je do greske na serveru.');
    res.redirect('/admin/books');
  }
});

router.get('/admin/books/author/:authorId', async (req, res) => {
  const authorId = req.params.authorId;

  try {
    // Find books associated with the selected author.
    const matchedBooks = await Book.find({ authors: authorId }).exec();

    res.json(matchedBooks);
  } catch (err) {
    console.error('Error searching for books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Rezervacije


router.get('/admin/reservations', async (req, res) => {
  try {
    const books = await Book.find();
    res.render('admin/reservations', { books });
  } catch (err) {
    res.status(500).send('Error fetching books');
  }
});



router.get('/admin/reservations/add', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const books = await Book.find();
    const users = await User.find(); // Fetch the users data
    res.render('admin/addreservations', { books, users }); // Pass both books and users variables to the template
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

// routes/admin.js

// AJAX ZA DETALJE KNJIGE
router.get('/admin/reservations/book/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const bookId = req.params.id;
    const selectedBook = await Book.findById(bookId);

    if (!selectedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(selectedBook);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching book details' });
  }
});

router.post('/admin/reservations/add', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const { book, user, /* add other reservation details here */ } = req.body;
    // Perform any necessary validation on the form data

    // Fetch the selected book from the database
    const selectedBook = await Book.findById(book);

    if (!selectedBook) {
      return res.status(404).send('Book not found');
    }

    // Fetch the selected user from the database
    const selectedUser = await User.findById(user);

    if (!selectedUser) {
      return res.status(404).send('User not found');
    }

    // Create a new reservation object using the reservation model
    const newReservation = new Reservation({
      book: selectedBook._id,
      user: selectedUser._id,
      // Add other reservation details here
    });

    // Save the new reservation data to the database
    await newReservation.save();

    // Redirect to the reservations page or show a success message
    res.redirect('/admin/reservations');
  } catch (err) {
    res.status(500).send('Error adding reservation');
  }
});


//kraj rezervacija

router.get('/admin/books/isbn/:title',  middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const title = req.params.title;
    const book = await Book.findOne({ title });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ isbn: book.ISBN }); 
	 console.log({ isbn: book.ISBN });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// aktivnosti logovanj
router.get('/admin/userActivity',  middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const pageNumber = req.query.page || 1;
    const perPage = 10; // Number of items per page

    // Fetch user activity data from the database with pagination
    const userActivity = await UserActivity.paginate({}, {
      page: pageNumber,
      limit: perPage,
      sort: { loginTime: 'desc' },
      populate: { path: 'userId', select: 'firstName lastName' } // Populate userId with firstName and lastName fields
    });

    // Render the userActivity.ejs template and pass the userActivity data
    res.render('admin/userActivity', { userActivity: userActivity.docs }); // Use userActivity.docs
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user activity');
  }
});

  // otpis knjige

  router.get('/admin/books/write-off', async (req, res) => {
	try {
	  const conflictDeadline = await Settings.findOne().select('conflictDeadline'); // Dobijte vrijednost konflikt Deadline iz podesavanja
	  const lateLoans = await Loan.find({ status: 'kasni' }).populate('book'); // Popunite polje 'book'
  
	  const lateBooks = lateLoans.filter(loan => {
		const dueDate = loan.dueTime;
		const currentDate = new Date();
		const overdueDays = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24)); //Izračunajte dane kašnjenja
  
		return overdueDays >= conflictDeadline.conflictDeadline; // Provjerite je li dani kašnjenja veći ili jednak konfliktnom roku
	  });
  
	  const lateBookIds = lateBooks.map(loan => loan.book._id); //Nabavite ID knjige za kasne pozajmice
  
	  const books = await Book.find({ _id: { $in: lateBookIds } }); // Pronađite knjige koje su kasnile na osnovu lateBookIds
  
	  res.render('admin/writeOffBooks', { books }); // Render the view with the overdue books
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Error fetching books for write-off');
	}
  });
  

  router.post('/admin/books/write-off', async (req, res) => {
	try {
	  const conflictDeadline = await Settings.findOne().select('conflictDeadline'); // Dobijte vrijednost konflikt Deadline iz podesavanja
	  const lateLoans = await Loan.find({ status: 'kasni' }).populate('book'); // Popunite polje 'book'
  
	  const lateBooks = lateLoans.filter(loan => {
		const dueDate = loan.dueTime;
		const currentDate = new Date();
		const overdueDays = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24)); //Izračunajte dane kašnjenja
  
		return overdueDays >= conflictDeadline.conflictDeadline; // Provjerite je li dani kašnjenja veći ili jednak konfliktnom roku
	  });
  
	  const lateBookIds = lateBooks.map(loan => loan.book._id); //Nabavite ID knjige za kasne pozajmice
  
	  await Book.updateMany(
		{ _id: { $in: lateBookIds } },
		{ $set: { status: 'written-off' } }
	  );
  
	  res.redirect('/admin/books'); // Preusmjeri nazad na knjige
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Error writing off books');
	}
  });
  
  //izmjenjeno u 1252 CETVRTAK, 10.08.23
  router.get('/admin/delete-login-history/:userId', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const userId = req.params.userId;
	  
	  // Delete the user's login history
	  await UserActivity.deleteMany({ userId });
  
	  req.flash('success', 'Login history deleted successfully');
	  res.redirect('/admin/profile');
	} catch (error) {
	  console.error(error);
	  req.flash('error', 'Error deleting login history');
	  res.redirect('/admin/profile');
	}
  });
  
  router.get('/auth/admin-logout', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const logoutTime = new Date(); // Get the current date and time
	  const userId = req.user._id;
  
	  // Update the user's last logout time in UserActivity
	  await UserActivity.updateOne(
		{ userId, logoutTime: { $exists: false } }, // Update only if logoutTime doesn't exist
		{ $set: { logoutTime } }
	  );
  
	  req.logout();
	  req.flash('success', 'Logged out successfully');
	  res.redirect('/');
	} catch (error) {
	  console.error(error);
	  req.flash('error', 'Error logging out');
	  res.redirect('/');
	}
  });

  
// Dodaj sliku
router.post('/admin/upload-photo', middleware.ensureLoggedIn, upload.single('photo'), async (req, res) => {
	try {
	  const user = await User.findById(req.user._id);
	
	  if (req.file) {
		const photoUrl = '/assets/users/images/' + req.file.filename;
		user.photo = photoUrl;
		await user.save();
	
		req.flash('success', 'Slika dodata uspešno');
		res.redirect('/admin/profile');
	  } else {
		req.flash('error', 'Niste izabrali sliku');
		res.redirect('/admin/profile');
	  }
	} catch (error) {
	  console.error(error);
	  req.flash('error', 'Greška tokom dodavanja slike');
	  res.redirect('/admin/profile');
	}
  });
  
  
  
  
  
  
  // Update-uj sliku
  router.post('/admin/update-photo', middleware.ensureLoggedIn, async (req, res) => {
	try {
	  const user = await User.findById(req.user._id);
	  
	  const photo = req.file;
	
	  const updatedPhotoUrl = '/assets/users/images/';
	  user.photo = updatedPhotoUrl;
	  await user.save();
  
	  req.flash('success', 'Slika update-ovana supsjesno');
	  res.redirect('/admin/profile');
	} catch (error) {
	  console.error(error);
	  req.flash('error', 'Greska tokom update-ovanja slike');
	  res.redirect('/admin/profile');
	}
  });
  
  // obrisi sliku
  router.post('/admin/delete-photo', middleware.ensureLoggedIn, async (req, res) => {
	try {
	  const user = await User.findById(req.user._id);
	  
	
	  user.photo = undefined;
	  await user.save();
  
	  req.flash('success', 'Slika uspjesno obrisana');
	  res.redirect('/admin/profile');
	} catch (error) {
	  console.error(error);
	  req.flash('error', 'Greska tokom brisanja slike');
	  res.redirect('/admin/profile');
	}
  });

  // Obrisi korisnika
  router.post('/admin/deleteUser/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const userId = req.params.id;
  
	  await User.findByIdAndRemove(userId);
  
	  req.flash('success', 'User deleted successfully.');
	  res.redirect('/admin/students');
	} catch (err) {
	  console.log(err);
	  req.flash('error', 'An error occurred while deleting the user.');
	  res.redirect('/admin/students');
	}
  });
  
  // Update User
  router.get('/admin/updateUser/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  const userId = req.params.id;
	  const user = await User.findById(userId);
  
	  res.render('admin/updateStudent', { title: 'Update User', user });
	} catch (err) {
	  console.error(err);
	  req.flash('error', 'An error occurred while updating the user.');
	  res.redirect('back');
	}
  });
  
  router.post('/admin/updateUser/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			User.id,
			{
			  firstName: req.body.firstName,
			  lastName: req.body.lastName,
			  email: req.body.email,
			  // Add other fields you want to update
			},
			{ new: true } // Return the updated document
		  );
		console.log('updatedUser:', updatedUser);
		res.redirect('/admin/students');
	  } catch (err) {
		console.error('Database Error:', err);
		req.flash('error', 'An error occurred while updating the user.');
		res.redirect('back');
	  }
	  
  });
  
  // dodaj korisnika/studenta
  router.get('/admin/addUser', middleware.ensureAdminLoggedIn, (req, res) => {
	res.render('admin/addStudent', { title: 'Add User' });
  });
  
  
  router.post('/admin/addUser', middleware.ensureAdminLoggedIn, upload.single('photo'), async (req, res) => {
	try {
	  const newUser = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		gender: req.body.gender,
		address: req.body.address,
		phone: req.body.phone,
		photo: req.file ? req.file.filename : undefined, //snima ime fajla
		role: 'korisnik', // us tartu dodajem ulogu
		// 
	  });
  
	  await newUser.save();
  
	  res.redirect('/admin/students');
	} catch (err) {
	  console.error(err);
	  req.flash('error', 'Došlo je do greške prilikom kreiranja korisnika.');
	  res.redirect('back');
	}
  });

  router.get('/admin/bookDetails/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      req.flash('error', 'Knjiga nije nadjena.');
      return res.redirect('/admin/books');
    }

    res.render('admin/bookDetails', { book, nonce: res.locals.nonce });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Došlo je do greške prilikom preuzimanja detalja knjige.');
    res.redirect('/admin/books');
  }
});

//najpopularnija
const calculateMostPopularBook = async () => {
	try {
	  const loanedBooks = await Loan.find({ status: { $in: ["izdata", "kasni"] } }).populate("book");
	  
	  const bookCountMap = new Map();
	  loanedBooks.forEach((loan) => {
		const bookTitle = loan.book.title;
		bookCountMap.set(bookTitle, (bookCountMap.get(bookTitle) || 0) + 1);
	  });
  
	  let maxCount = 0;
	  let mostPopularBookTitle = "";
	  bookCountMap.forEach((count, title) => {
		if (count > maxCount) {
		  maxCount = count;
		  mostPopularBookTitle = title;
		}
	  });
  
	  return { mostPopularBookTitle, mostPopularBookCount: maxCount };
	} catch (err) {
	  console.error("Error calculating most popular book:", err);
	  return { mostPopularBookTitle: "N/A", mostPopularBookCount: 0 };
	}
  };
module.exports = router;