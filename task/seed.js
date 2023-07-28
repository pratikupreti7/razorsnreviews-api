require('dotenv').config()
const mongoose = require('mongoose')
const Salon = require('../model/Salon') // adjust the path accordingly

// replace with your own connection string
const dbURI = process.env.DB_CONNECT

const seedData = [
  {
    name: 'Local Hair Done',
    description: 'The bestest salon in town',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: '123-456-7890',
    email: 'info4@mysalon.com',
    website: 'https://mysalon2.com',
    services: ['Haircut', 'Coloring'],
    employees: [],
    ratings: [],
    covidSafety: 5,
  },
  {
    name: 'Shear Delight',
    description: 'Your local family hair salon.',
    address: '456 Park Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60614',
    phone: '234-567-8910',
    email: 'info@sheardelight.com',
    website: 'https://sheardelight.com',
    services: ['Haircut', 'Styling', 'Coloring'],
    employees: [],
    ratings: [],
    covidSafety: 4,
  },
  {
    name: 'Curl Up and Dye',
    description: 'Chic and modern salon for the trendy you.',
    address: '789 Broadway',
    city: 'San Francisco',
    state: 'CA',
    zip: '94133',
    phone: '345-678-9101',
    email: 'info@curlupanddye.com',
    website: 'https://curlupanddye.com',
    services: ['Haircut', 'Coloring', 'Styling', 'Spa'],
    employees: [],
    ratings: [],
    covidSafety: 4,
  },
  {
    name: 'Beach Waves Salon',
    description: 'Where hair meets style.',
    address: '321 Ocean Dr',
    city: 'Miami',
    state: 'FL',
    zip: '33139',
    phone: '456-789-1011',
    email: 'info@beachwaves.com',
    website: 'https://beachwaves.com',
    services: ['Haircut', 'Coloring', 'Styling'],
    employees: [],
    ratings: [],
    covidSafety: 3,
  },
  {
    name: 'The Color Palette',
    description: 'Mastering the art of hair coloring.',
    address: '654 Vine St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90028',
    phone: '567-891-0112',
    email: 'info@colorpalette.com',
    website: 'https://colorpalette.com',
    services: ['Haircut', 'Coloring'],
    employees: [],
    ratings: [],
    covidSafety: 5,
  },
  {
    name: 'Braidy Bunch',
    description: 'Specializing in braids of all types.',
    address: '987 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    phone: '678-910-1121',
    email: 'info@braidybunch.com',
    website: 'https://braidybunch.com',
    services: ['Haircut', 'Coloring', 'Braiding'],
    employees: [],
    ratings: [],
    covidSafety: 4,
  },
  {
    name: 'Spa Serenity',
    description: 'Ultimate relaxation and rejuvenation.',
    address: '555 Tranquil Blvd',
    city: 'San Diego',
    state: 'CA',
    zip: '92109',
    phone: '789-101-1213',
    email: 'info@spaserenity.com',
    website: 'https://spaserenity.com',
    services: ['Spa'],
    employees: [],
    ratings: [],
    covidSafety: 5,
  },
  {
    name: 'Chic Cutz',
    description: 'Modern haircuts for modern people.',
    address: '161 Trendy Lane',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90068',
    phone: '321-654-9876',
    email: 'info@chiccutz.com',
    website: 'https://chiccutz.com',
    services: ['Haircut'],
    employees: [],
    ratings: [],
    covidSafety: 4,
  },
  {
    name: 'Radiant Coloring',
    description: 'Vibrant hair color for a vibrant life.',
    address: '55 Rainbow Rd',
    city: 'Austin',
    state: 'TX',
    zip: '73301',
    phone: '555-777-9999',
    email: 'info@radiantcoloring.com',
    website: 'https://radiantcoloring.com',
    services: ['Coloring'],
    employees: [],
    ratings: [],
    covidSafety: 5,
  },
  {
    name: 'Styling Statements',
    description: 'Hairstyles that make a statement.',
    address: '200 Fashion Ave',
    city: 'New York',
    state: 'NY',
    zip: '10018',
    phone: '212-123-4567',
    email: 'info@stylingstatements.com',
    website: 'https://stylingstatements.com',
    services: ['Styling'],
    employees: [],
    ratings: [],
    covidSafety: 3,
  },
]
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database')

    let collectionExists = false

    const collections = mongoose.connection.db.listCollections().toArray()

    collections
      .then((cols) => {
        console.log('Collections:', cols)
        cols.forEach((col) => {
          if (col.name === 'salons') {
            collectionExists = true
          }
        })

        if (collectionExists) {
          console.log('Collection exists, trying to drop it...')
          mongoose.connection.db.dropCollection('salons', function (
            err,
            result,
          ) {
            if (err) {
              console.log('Error in dropping collection:', err)
            } else {
              console.log('Collection dropped')
              insertData()
            }
          })
        } else {
          console.log('Collection does not exist, trying to insert data...')
          insertData()
        }
      })
      .catch((error) => console.log('Error in listing collections:', error))
  })
  .catch((err) => console.log('Database connection failed:', err))

function insertData() {
  Salon.insertMany(seedData)
    .then((res) => {
      console.log('Data seeded')
      mongoose.connection.close()
    })
    .catch((err) => {
      console.log('Error in seeding data:', err)
      mongoose.connection.close()
    })
}
