const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Book = require("../models/book.js");
const Loan = require("../models/loan.js");
const Activity = require("../models/activity.js");
const Author = require('../models/author.js');
const nodemailer = require("nodemailer");


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		await Loan.updateMany({ status: "izdata", dueTime: { $lt: new Date() } }, {status: "kasni"});
		const numStudents = await User.countDocuments({ role: "korisnik" });
		const numAdmins = await User.countDocuments({ role: "admin" });
		const books = await Book.find();
		const numDistinctBooks = books.length;
		const numTotalBooks = books.reduce((total, book) => total + book.copiesOwned, 0);
		const numBooksNotReturned = await Loan.countDocuments({ status: ["izdata", "kasni"] });
		const numBooksOverdue = await Loan.countDocuments({ status: "kasni" });
		
		res.render("admin/dashboard", {
			title: "Dashboard",
			numStudents, numAdmins, numDistinctBooks, numTotalBooks, numBooksNotReturned, numBooksOverdue
		});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

router.get("/admin/activities", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const activities = await Activity.find().populate("admin").populate("korisnik").populate("book").sort("-activityTime");
		res.render("admin/activities", { title: "Activities", activities });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
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
});


router.get("/admin/books/add", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/addBook", { title: "Add Book" });
});

router.post("/admin/books/add", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const book = req.body.book;
		if(book.ISBN.toString().length != 13)
		{
			req.flash("error", "ISBN broj mora biti duzine 13");
			return res.redirect("back");
		}
		book.stock = book.copiesOwned;
		const newBook = new Book(book);
		await newBook.save();
		
		const newActivity = new Activity({
			category: "dodajknjigu",
			admin: req.user._id,
			book: newBook._id
		});
		await newActivity.save();
		
		req.flash("success", "Knjiga uspjesno dodata");
		res.redirect("/admin/books");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
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
		req.flash("success", "Knjiga uspjesno dodana!");
		res.redirect("/admin/books");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
		res.redirect("back");
	}
});

//izdaj knjigu
router.get("/admin/issue", middleware.ensureAdminLoggedIn, async (req,res) => {
	res.render("admin/issueBook", { title: "Izdaj knjigu" });
});

router.get("/admin/issue/:bookId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const bookId = req.params.bookId;
		// Add your logic here to issue the book based on the bookId
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

router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/profile", { title: "My Profile" });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.admin;	
		await User.findByIdAndUpdate(id, updateObj);
		
		const newActivity = new Activity({
			category: "updateAdminProfile",
			admin: req.user._id,
		});
		await newActivity.save();
		
		req.flash("success", "Profil uspjesno update-ovan.");
		res.redirect("/admin/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Doslo je do greske na serveru.")
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

  console.log('Received authorName:', authorName);

  try {
    const books = await Book.find({ authors: { $regex: new RegExp(authorName, 'i') } });
    console.log('Fetched books:', books);

    res.json(books);
  } catch (err) {
    console.error('Error fetching books by author:', err);
    res.status(500).json({ error: 'Error fetching books by author' });
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




module.exports = router;