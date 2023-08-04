const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
  reservationDate: {
    type: Date,
    required: true,
    default: Date.now, // Set the default value to the current date
  },
  reservationLastsUntil: {
    type: Date,
    required: true,
  },
});

// Add a virtual property to calculate the reservation expiration date (7 days from the reservation date)
reservationSchema.virtual("reservationExpiration").get(function () {
  const expirationDate = new Date(this.reservationDate);
  expirationDate.setDate(expirationDate.getDate() + 7);
  return expirationDate;
});

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
