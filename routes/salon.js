/*
 *************  Imports **********************
 */
const router = require('express').Router()
const verify = require('./verifyToken')
const Salon = require('../model/Salon')
const salonSchema = require('../validation/salonSchemaValidation')
/*
 ************* PUT: UPDATE A SALON BY ID **********************
 */
router.put('/:id', verify, async (req, res) => {
  try {
    // Find the salon by ID
    const salon = await Salon.findById(req.params.id)

    // Check if the salon exists
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' })
    }

    // Check if the logged-in user is the owner of the salon
    if (salon.user.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // update salon details
    const {
      name,
      description,
      address,
      city,
      state,
      zip,
      phone,
      email,
      website,
      services,
      price,
      pic,
    } = req.body

    // validate salon data using Joi schema
    const { error } = salonSchema.validate({
      name,
      description,
      address,
      city,
      state,
      zip,
      phone,
      email,
      website,
      services,
      price,
    })

    // if there's an error, return 400 Bad Request response
    if (error) {
      return res.status(400).send(error.details[0].message)
    }

    // if valid, update the salon
    salon.name = name
    salon.description = description
    salon.address = address
    salon.city = city
    salon.state = state
    salon.zip = zip
    salon.phone = phone
    salon.email = email
    salon.website = website
    salon.services = services
    salon.price = price
    salon.pic = pic

    // save updated salon
    await salon.save()

    res.json({ message: 'Salon updated successfully', salon })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/*
 ************* DELETE: DELETE A SALON BY ID **********************
 */
router.delete('/:id', verify, async (req, res) => {
  try {
    // Find the salon by ID
    const salon = await Salon.findById(req.params.id)

    // Check if the salon exists
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' })
    }

    // Check if the logged-in user is the owner of the salon
    if (salon.user.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Delete the salon
    await Salon.deleteOne({ _id: salon._id })

    res.json({ message: 'Salon deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/*
 ************* GET: ALL SALONS **********************
 */
router.get('/', async (req, res) => {
  try {
    const salons = await Salon.find()
    res.json(salons)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/*
 ************* GET: Single SALONS BY ID **********************
 */
router.get('/:id', getSalon, (req, res) => {
  res.json(res.salon)
})
/*
 ************* GET: SALON BY USER ID **********************
 */
router.get('/user/:userId', verify, async (req, res) => {
  try {
    // Get the user id from the route parameters
    const userId = req.params.userId

    // Find the salons that have a user field matching the userId
    const salons = await Salon.find({ user: userId })

    // If no salon is found for this user
    if (!salons.length) {
      return res.status(404).json({ message: 'No salon found for this user' })
    }

    // Return the found salon
    res.json(salons)
  } catch (error) {
    // If an error occurred, return a server error response
    res.status(500).json({ message: error.message })
  }
})
/*
 ************* MIDDLEWARE  **********************
 */
async function getSalon(req, res, next) {
  try {
    const salon = await Salon.findById(req.params.id).populate('reviews')

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' })
    }

    await salon.save()
    res.salon = salon
    next()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/*
 ************* POST: CREATE A NEW  SALON **********************
 */
router.post('/', verify, async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      zip,
      phone,
      email,
      website,
      services,
      price,
      pic,
    } = req.body

    // validate salon data using Joi schema
    const { error } = salonSchema.validate({
      name,
      description,
      address,
      city,
      state,
      zip,
      phone,
      email,
      website,
      services,
      price,
    })

    // if there's an error, return 400 Bad Request response
    if (error) {
      return res.status(400).send(error.details[0].message)
    }
    // if there's an error, Email Already Exists
    const emailExists = await Salon.findOne({ email: req.body.email })

    if (emailExists) {
      return res.status(400).send('Email already exists')
    }
    // if there's an error, Website Already Exists
    const websiteExixts = await Salon.findOne({ website: req.body.website })

    if (websiteExixts) {
      return res.status(400).send('Website already exists')
    }
    // get user ID from the verified token
    const userId = req.user._id

    // create new salon object with user ID
    const salon = new Salon({
      name,
      description,
      address,
      city,
      state,
      zip,
      phone,
      email,
      website,
      services,
      price,
      user: userId,
      pic,
    })

    const savedSalon = await salon.save()
    res.send(savedSalon)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

/*
 ************* PUT: ADD IMAGE TO A SALON BY ID **********************
 */
router.put('/:id/add-image', verify, async (req, res) => {
  try {
    // Find the salon by ID
    const salon = await Salon.findById(req.params.id)

    // Check if the salon exists
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' })
    }

    // Check if the logged-in user is the owner of the salon
    if (salon.user.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { imageUrls } = req.body

    // Check if the salon already has the maximum number of images
    if (imageUrls.length > 6) {
      return res
        .status(400)
        .json({ message: 'Maximum number of images exceeded' })
    }

    // Update the allImages array with the new image URLs
    salon.allImages = imageUrls

    // Save the updated salon document
    await salon.save()

    res.json({ message: 'Images added successfully', salon })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
