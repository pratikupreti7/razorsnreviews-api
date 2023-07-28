/*
 ************* Import Statements**********************
 */
const { boolean } = require('@hapi/joi')
const mongoose = require('mongoose')
/*
 ************* User Schema  **********************
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 256,
    min: 2,
  },
  email: {
    type: String,
    required: true,
    max: 255,
    min: 6,
  },

  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // isAdmin: {
  //   type: boolean,
  //   default: false,
  // },
  pic: {
    type: String,
    default: 'https://img.freepik.com/free-icon/user_318-804790.jpg',
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
})

module.exports = mongoose.model('User', userSchema)
