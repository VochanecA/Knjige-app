const mongoose = require("mongoose");

const bindingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Binding = mongoose.model("Binding", bindingSchema);

module.exports = Binding;
