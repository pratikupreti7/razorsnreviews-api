/*
 *************  Imports **********************
 */
const express = require('express')
const router = express.Router()
const verifyToken = require('./verifyToken')
const Review = require('../model/Review')
const Salon = require('../model/Salon')
const User = require('../model/User')

/*
 ************* POST: Create a new review **********************
 */
const wordCount = (text) => text.trim().split(/\s+/).length

router.post('/', verifyToken, async (req, res) => {
  try {
    const { salonId, rating, description, comment } = req.body
    const userId = req.user._id

    const existingReview = await Review.findOne({
      salon: salonId,
      'user.id': userId,
    })

    if (existingReview) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this salon' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating needs to be between 1-5' })
    }

    if (wordCount(comment) < 2) {
      return res
        .status(400)
        .json({ message: 'Review should be at least 2 words long' })
    }
    if (wordCount(comment) > 10000) {
      return res
        .status(400)
        .json({ message: 'Review should be at most 10000 words long' })
    }

    if (wordCount(description) > 5) {
      return res
        .status(400)
        .json({ message: 'Description should be at most 5 words long' })
    }

    if (wordCount(description) < 2) {
      return res
        .status(400)
        .json({ message: 'Description should be at leasr 2 words long' })
    }

    // Fetch user details (name and profile picture)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const review = new Review({
      salon: salonId,
      user: {
        id: userId,
        name: user.name,
        profilePicture: user.pic,
      },
      rating,
      description,
      comment,
    })

    const savedReview = await review.save()

    const salon = await Salon.findById(salonId)

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' })
    }

    salon.reviews.push(savedReview)

    await salon.save()
    await salon.calculateAverageRating() // Calculate average rating

    res.json({ message: 'Review created successfully', review: savedReview })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ...

/*
 ************* DELETE: Delete a review by ID **********************
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const reviewId = req.params.id
    const userId = req.user._id

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.user.toString() !== userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await Review.deleteOne({ _id: reviewId })

    // Remove the review's ID from the Salon's reviews array
    const salon = await Salon.findById(review.salon)
    salon.reviews.pull(reviewId)
    await salon.save()
    await salon.calculateAverageRating() // Calculate average rating

    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/*
 ************* PUT: Update a review by ID **********************
 */
router.put('/:salonId', verifyToken, async (req, res) => {
  try {
    const salonId = req.params.salonId
    const userId = req.user._id

    // Find the latest review with the specified user ID and salon ID
    const review = await Review.findOne({ 'user.id': userId, salon: salonId })
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .limit(1) // Limit the result to one review

    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.user.id.toString() !== userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    review.rating = req.body.rating
    review.description = req.body.description
    review.comment = req.body.comment

    if (review.rating < 1 || review.rating > 5) {
      return res.status(400).json({ message: 'Rating needs to be between 1-5' })
    }

    if (wordCount(review.comment) < 2) {
      return res
        .status(400)
        .json({ message: 'Review should be at least 2 words long' })
    }

    if (wordCount(review.comment) > 10000) {
      return res
        .status(400)
        .json({ message: 'Review should be at most 10000 words long' })
    }

    if (wordCount(review.description) > 5) {
      return res
        .status(400)
        .json({ message: 'Description should be at most 5 words long' })
    }

    if (wordCount(review.description) < 2) {
      return res
        .status(400)
        .json({ message: 'Description should be at least 2 words long' })
    }

    const updatedReview = await review.save()
    const salon = await Salon.findById(review.salon)
    await salon.calculateAverageRating() // Calculate average rating

    res.json({ message: 'Review updated successfully', review: updatedReview })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/*
 ************* GET: Get a review by ID **********************
 */
router.get('/:id', async (req, res) => {
  try {
    const reviewId = req.params.id

    // Find the review by ID
    const review = await Review.findById(reviewId)

    // Check if the review exists
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    res.json(review)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/*
 ************* GET: Get a review by User ID **********************
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId

    // Find all reviews with the specified user ID
    const reviews = await Review.find({ 'user.id': userId })

    // Extract the salon IDs from the reviews
    const salonIds = reviews.map((review) => review.salon)

    res.json({ salonIds })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/*
 ************* GET: Get reviews of a user for a particular salon **********************
 */
router.get('/user/:userId/salon/:salonId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId
    const salonId = req.params.salonId

    // Find the latest review with the specified user ID and salon ID
    const review = await Review.findOne({ 'user.id': userId, salon: salonId })
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .limit(1) // Limit the result to one review

    // Check if a review exists
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    // Verify if the current user wrote the review
    if (review.user.id.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    res.json({ review })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router

module.exports = router
