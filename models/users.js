const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  user_type_id: { type: Number, required: true },
  user_gender_id: { type: Number, required: true },
  name: { type: String, required: true, maxlength: 15 },
  JMBG: { type: String, required: true, maxlength: 15 },
  email: { type: String, required: true, maxlength: 45 },
  username: { type: String, required: true, maxlength: 45 },
  email_verified_at: { type: Date },
  password: { type: String, required: true, maxlength: 25 },
  photo: { type: String, maxlength: 200 },
  remember_token: { type: String, maxlength: 100 },
  last_login_at: { type: Date },
  login_count: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  github: { type: String },
  active: { type: Boolean }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
