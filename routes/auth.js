/*
 *************  Imports **********************
 */
const router = require('express').Router()
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/*
 ************* Environment variable **********************
 */
const dotenv = require('dotenv')
dotenv.config()
/*
 ************* Validation Import **********************
 */
const {
  authSchemaSignUp,
  authSchemaLogin,
} = require('../validation/userSchemaValidation')

/*
 ************* Register **********************
 */

router.post('/register', async (req, res) => {
  try {
    /*
     ************* Registration Validation **********************
     */

    const { error } = await authSchemaSignUp.validateAsync(req.body)

    if (error) {
      return res.status(400).send(error.details[0].message)
    }
    /*
     ************* Check if User already exists **********************
     */
    const email = req.body.email.toLowerCase()
    const emailExists = await User.findOne({ email: email })

    if (emailExists) {
      return res.status(400).send('Email already exists')
    }
    /*
     ************* Hashing the password **********************
     */
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    /*
     ************* Create a new User **********************
     */
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      pic: req.body.pic || undefined,
    })
    /*
     ************* Save new User **********************
     */
    const savedUser = await user.save()
    res.send(savedUser)
  } catch (error) {
    return res
      .status(400)
      .send(error.details ? error.details[0].message : error.message)
  }
})
/*
 ************* Login **********************
 */
router.post('/login', async (req, res) => {
  try {
    /*
     ************* Login Validation **********************
     */

    const { error } = await authSchemaLogin.validateAsync(req.body)

    if (error) {
      return res.status(400).send(error.details[0].message)
    }
    /*
     ************* Check if User already exists **********************
     */
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(400).send('Email or password does not match')
    }
    /*
     ************* Check for password  **********************
     */
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return res.status(400).send('Email or password does not match')
    }
    /*
     ************* Sucess Everthing works then  **********************
     */
    // return res.send('Logged In')
    /*
     *************  Create and Assign a token  **********************
     */
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    // Convert user document to a plain JavaScript object
    let userObj = user.toObject()

    // Add token property to user object
    userObj.token = token

    // Delete sensitive properties
    delete userObj.password

    res.header('auth-token', token).send(userObj)
  } catch (error) {
    return res
      .status(400)
      .send(error.details ? error.details[0].message : error.message)
  }
})
module.exports = router
