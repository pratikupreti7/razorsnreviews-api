/*
 ************* Import statements **********************
 */
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const cors = require('cors')
/*
 ************* Environment variable **********************
 */
const dotenv = require('dotenv')
dotenv.config()

/*
 ************* Import routes **********************
 */
const userRoute = require('./routes/auth')
const salonRoute = require('./routes/salon')
const reviewRoute = require('./routes/reviews')
/*
 ************* Connection to Database **********************
 */

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to database 😇 ....'))
  .catch((error) => console.error(error))

/*
 ************* Middleware **********************
 */
app.use(express.json())
const corsOptions = [
  'https://razorsnreviews.onrender.com',
  'https://razorsnreview.onrender.com',
  'http://localhost:3000',
  'http://localhost:3003',
] // Replace this with your frontend URL

app.use(
  cors({
    origin: corsOptions,
  }),
)

app.use('/api/user', userRoute)
app.use('/api/salon', salonRoute)
app.use('/api/reviews', reviewRoute)

/*
 ************* Deployment **********************
 */
// https://razorsnreviews.onrender.com/

// Set the correct path to the frontend build folder
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

/*
 ************* Catch-all route for client-side routing **********************
 */
const publicPath = path.join(__dirname, 'path-to-your-build-folder') // Replace 'path-to-your-build-folder' with the correct path to your client-side build folder
app.use(express.static(publicPath))

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})
/*
 ************* Server **********************
 */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  console.log(
    'Sugetions for nested comments https://www.youtube.com/watch?v=lyNetvEfvT0',
  )
  /*
{
   "email":"pupreti123t@123.com",
    "password":"Messi123"

}
*/
  console.log('Login', 'pupreti123t@123.com', 'Messi123')
})
