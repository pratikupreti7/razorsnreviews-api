const Joi = require('@hapi/joi')
/*
 ************* Salon Schema Validation  **********************
 */
const salonSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(10).max(500).required(),
  address: Joi.string().min(5).max(255).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().length(2).required(),
  zip: Joi.string().min(5).max(10).required(),
  phone: Joi.string().min(10).max(20).required(),
  email: Joi.string().email().required(),
  services: Joi.array().items(Joi.string()),
  website: Joi.string().uri().required(),
  covidSafetyRating: Joi.number().min(1).max(2),
  price: Joi.number().min(1),
})

module.exports = salonSchema
