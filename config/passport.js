const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");

module.exports = function(passport) {
	passport.use( "local-admin",
		new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, (email, password, done) => {
			User.findOne({ email: email, role: "admin" })
				.then(user => {
					if(!user)
						return done(null, false, { message: "Email nije registrovan" });
					
					bcrypt.compare(password, user.password, (err, isMatch) => {
						if(err)	throw err;
						if(isMatch)
							return done(null, user, { message: "Uspjesno logovan" });
						else
							return done(null, false, {message: "Password nije tacan"});
					})
				})
				.catch(err => console.log(err));
		})
	);
	
	passport.use( "local-korisnik",
		new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, (email, password, done) => {
			User.findOne({ email: email, role: "korisnik" })
				.then(user => {
					if(!user)
						return done(null, false, { message: "Email nije registrovan" });
					
					bcrypt.compare(password, user.password, (err, isMatch) => {
						if(err)	throw err;
						if(isMatch)
							return done(null, user, { message: "Uspjesno logovan" });
						else
							return done(null, false, {message: "Password nije tacan"});
					})
				})
				.catch(err => console.log(err));
		})
	);
	
	
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
	
}

