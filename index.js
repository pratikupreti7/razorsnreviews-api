/*
 ************* Import statements **********************
 */
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
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

app.use('/api/user', userRoute)
app.use('/api/salon', salonRoute)
app.use('/api/reviews', reviewRoute)

/*
 ************* Deployment **********************
 */
__dirname = path.resolve()
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '/frontend', '/build', '/index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('Api is running')
  })
}
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
