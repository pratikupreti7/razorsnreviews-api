const mongoose = require('mongoose')

const salonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    zip: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    services: [
      {
        type: String,
      },
    ],
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    // Existing fields...
    allImages: [
      {
        type: String,
      },
    ],

    covidSafety: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    pic: {
      type: String,
      default: '',
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
  },
)
// Method to calculate and update the average rating
salonSchema.methods.calculateAverageRating = async function () {
  const reviews = await mongoose
    .model('Review')
    .find({ _id: { $in: this.reviews } })
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    this.avgRating = totalRating / reviews.length
  } else {
    this.avgRating = 0
  }
  await this.save()
}

const Salon = mongoose.model('Salon', salonSchema)

module.exports = Salon
