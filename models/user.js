'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String },
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  
});

userSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

userSchema.methods.validatePassword = function (password) {
  return password === this.password;
};

module.exports = mongoose.model('User', userSchema);
