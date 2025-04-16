const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    fname:{
        type: String,
        required: true
    },

    lname:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    dob:{
        type: Date,
        required: true,
        default: Date.now
    },

    zip:{
        type: Number,
        required: true
    },

    password:{
        type: String,
        required: true
    },

    TimeStamp:{
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('web_user', UserSchema);
User.createIndexes();

module.exports = User;