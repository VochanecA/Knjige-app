const express = require("express");
const app = express();
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

require("dotenv").config();
require("./config/dbConnection.js")();
require("./config/passport.js")(passport);

// Postavljanje bezbjednosnih opcija koristeći Helmet
app.use(helmet());
app.use(
	helmet.hsts({
		maxAge: 60 * 60 * 24 * 60, // 60 dana
		includeSubDomains: false,
	})
);
app.use(helmet.contentSecurityPolicy({
	directives: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'", 'code.jquery.com', 'maxcdn.bootstrapcdn.com'],
		styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
		fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com','fonts.googleapis.com']
	}
}));
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

// Statički resursi (CSS, JS, itd.)
app.use("/assets", express.static(__dirname + "/assets"));

// Podešavanje EJS templating-a sa ejs ekstenzijom
app.set("view engine", "ejs");
app.use(expressLayouts);

// Rute
app.get("/", (req, res) => {
	res.render("welcome");
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
