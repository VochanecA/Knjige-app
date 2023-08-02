const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  biography: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  }
}, { timestamps: true });

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
