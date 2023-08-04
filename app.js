const express = require("express");
const app = express();
const compression = require('compression');
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const authRoutes = require("./routes/auth.js");
const studentRoutes = require("./routes/student.js")
const adminRoutes = require("./routes/admin.js")
const helmet = require("helmet")
const ipfilter = require('express-ipfilter').IpFilter;
const Book = require("./models/book.js");
const crypto = require('crypto');


require("dotenv").config();
require("./config/dbConnection.js")();
require("./config/passport.js")(passport);




// Postavljanje bezbjednosnih opcija koristeći Helmet
app.use(helmet());
app.use(compression());

/* if (process.env.NODE_ENV !== 'production') {
	app.use(debugMiddleware());
} */

app.use(
	helmet.hsts({
		maxAge: 60 * 60 * 24 * 60, // 60 dana u sekundama
		includeSubDomains: false,
	})
);


app.disable('x-powered-by');
app.use(helmet.xssFilter());
app.use(helmet.ieNoOpen());

// Blokirane IPs
const disallowedIPs = process.env.BLOKIRANE_IP.split(',');
const ipFilterMiddleware = ipfilter(disallowedIPs, { mode: 'deny' });
app.use(ipFilterMiddleware);

//  Parsiranje podataka iz zahtjeva (Body Parser)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Postavljanje Express sesija
app.use(session({
	secret: "Idemn4m0r3",
	resave: true,
	saveUninitialized: true
}));

//  Inicijalizacija Passport modula
app.use(passport.initialize());
app.use(passport.session());

// Flash-uj poruke tj obavjestenja
app.use(flash());

// Metoda za preusmjeravanje HTTP zahtjeva (Method Override)
app.use(methodOverride("_method"));

// Middleware za lokalne varijable
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.warning = req.flash("warning");
	next();
});
//nonce da se salje svima

const nonce = crypto.randomBytes(16).toString('base64');

// Pass the nonce value to all templates
app.use((req, res, next) => {
  res.locals.nonce = nonce;
  next();
});

// Set the CSP header with the 'nonce' value
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);
  next();
});


// Statički resursi (CSS, JS, itd.)
app.use("/assets", express.static(__dirname + "/assets"));

// Podešavanje EJS templating-a sa ejs ekstenzijom
app.set("view engine", "ejs");
app.use(expressLayouts);

// Rute
app.get("/", async (req, res) => {
  try {
    const randomBooks = await Book.aggregate([{ $sample: { size: 5 } }]);
	
    res.render("welcome", { randomBooks });
  } catch (err) {
    console.error(err);
    res.render("404page", { message: "Greska u citanju random knjiga" });
  }
});

app.use(authRoutes);
app.use(studentRoutes);
app.use(adminRoutes);
//Ruta za obradu nepostojećih zahteva
app.use((req, res) => {
	res.status(404).render("404page");
});


//Podešavanje porta na koji će server raditi...moze i kroz .env 
const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server je pokrenut na http://localhost:${port}`));
