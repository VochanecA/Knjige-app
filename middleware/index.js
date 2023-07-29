const middleware = {
	ensureLoggedIn: (req, res, next) => {
		if(req.isAuthenticated()) {
			return next();
		}
		req.flash("warning", "Prvo se logujet da bi nastavili...");
		res.redirect("/auth/student-login");
	},
	
	ensureAdminLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Prvo se logujet da bi nastavili...");
			return res.redirect("/auth/admin-login");
		}
		if(req.user.role != "admin") {
			req.flash("warning", "Ovo je samo za admina!!");
			return res.redirect("/");
		}
		next();
	},
	
	ensureStudentLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Prvo se logujet da bi nastavili...");
			return res.redirect("/auth/student-login");
		}
		if(req.user.role != "student") {
			req.flash("warning", "Ovo je samo za korisnika!!");
			return res.redirect("/");
		}
		next();
	},
	
	ensureNotLoggedIn: (req, res, next) => {
		if(req.isAuthenticated()) {
			req.flash("warning", "Prvo se izlogujte da bi nastavili...");
			if(req.user.role == "admin")
				return res.redirect("/admin/dashboard");
			if(req.user.role == "student")
				return res.redirect("/student/dashboard");
		}
		next();
	}
	
}

module.exports = middleware;