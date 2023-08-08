const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date },
});

// Apply mongoose-paginate-v2 plugin to the schema
userActivitySchema.plugin(require('mongoose-paginate-v2'));

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
