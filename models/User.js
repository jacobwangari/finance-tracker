const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  password: {
    type: String
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);