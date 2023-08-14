/* const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  ISBN: {
    type: Number,
    required: true
  },
  description: String,
  authors: String,
  category: String,
  copiesOwned: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  image: String,
  comments: mongoose.Schema.Types.Mixed
});

const Book = mongoose.model("books", bookSchema);
module.exports = Book;
 */

const mongoose = require("mongoose");

// svi tipovi poveza
const availableBindings = [
  "Povezivanje sedlastim bodovima",
  "PUR vezivanje",
  "Tvrdi ili futrolni povez",
  "Singer ušiveni povez",
  "Singer povez",
  "Sekcija šivenog poveza",
  "Povezivanje koptskim šavom",
  "Žica, češalj ili spiralni uvez",
  "Interscrew binding",
  "Japanski povez",
  "Solander kutije i torbe",
];

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  ISBN: {
    type: Number,
    required: true,
  },
  description: String,
  authors: String,
  category: String,
  copiesOwned: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  image: String,
  comments: mongoose.Schema.Types.Mixed,
  entryDate: {
    type: Date,
    default: Date.now,
  },
  bindings: {
    type: String,
    enum: availableBindings, // Only allows values from the availableBindings array
    default: "Tvrdi ili futrolni povez", // Default binding type
  },
  status: {
    type: String,
    enum: ["active", "written-off"], // Enum for status
    default: "active", // Default status
  },
});

const Book = mongoose.model("books", bookSchema);
module.exports = Book;

