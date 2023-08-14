const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // Make sure you use the correct package name

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date },
});

// Apply mongoose-paginate-v2 plugin to the schema before creating the model
userActivitySchema.plugin(mongoosePaginate);
const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;