const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
	category: {
		type: String,
		enum: ["izdaj", "vrati", "dodajknjigu", "updateknjigu", "updateAdminProfile", "updateStudentProfile"],
		required: true
	},
	activityTime: {
		type: Date,
		default: Date.now
	},
	admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users"
	},
	korisnik: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users"
	},
	book: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "books"
	},
	loan: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "loans"
	}
});

const Activity = mongoose.model("activities", activitySchema);
module.exports = Activity;