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
const verifyToken = require('./verifyToken')

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
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    // Convert user document to a plain JavaScript object
    let userObj = user.toObject()

    // Add token property to user object
    userObj.token = token
    const savedUser = await userObj.save()
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
router.post('/updatepic', verifyToken, async (req, res) => {
  try {
    const { userId, cloudinaryId } = req.body
    // get user ID from the verified token
    const userIdfromToken = req.user._id

    if (userIdfromToken !== userId) {
      return res.status(400).send('Forbidden request')
    }

    // Fetch the user by userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).send('User not found')
    }

    // Update user's profile picture (pic) with the Cloudinary ID
    user.pic = cloudinaryId
    await user.save()
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)

    // Return the updated user object without the password
    const userObj = user.toObject()
    // Add token property to user object
    userObj.token = token

    delete userObj.password

    res.send(userObj)
  } catch (error) {
    return res.status(400).send(error.message)
  }
})

router.post('/updateinfo', verifyToken, async (req, res) => {
  try {
    const { userId, name, email, currentpassword, newpassword } = req.body

    // get user ID from the verified token
    const userIdfromToken = req.user._id

    if (userIdfromToken !== userId) {
      return res.status(400).send('Forbidden request')
    }

    // Fetch the user by userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).send('User not found')
    }

    // Update user's info
    if (name) {
      user.name = name
    }
    // Only update email and password if provided
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return res.status(400).send('Email is already in use')
      }
      user.email = email
    }
    if (currentpassword && newpassword) {
      const validPassword = await bcrypt.compare(currentpassword, user.password)
      if (!validPassword) {
        return res.status(400).send('Current password is incorrect')
      }
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newpassword, salt)
      user.password = hashedPassword
    }
    await user.save()
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)

    // Return the updated user object without the password
    const userObj = user.toObject()
    // Add token property to user object
    userObj.token = token
    delete userObj.password

    res.send(userObj)
  } catch (error) {
    return res.status(400).send(error.message)
  }
})
module.exports = router
