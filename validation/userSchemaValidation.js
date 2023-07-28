/*
 ************* Importing Joi **********************
 */

const Joi = require('@hapi/joi')

/*
 ************* Signup : User Schema Validation  **********************
 */
const authSchemaSignUp = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
  pic: Joi.string(),
})

/*
 ************* Login : User Schema Validation  **********************
 */
const authSchemaLogin = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
})

module.exports = {
  authSchemaSignUp,
  authSchemaLogin,
}
