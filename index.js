const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const userExercises = require('./routes/user-exercises')
const connectDB = require('./db/connect')


app.use(cors())
app.use(express.static('./public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// routes
app.use('/', userExercises)


// Database connection and spinning up the server
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    console.log('Connected to database')
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })
  } catch (error) {
    console.error('Failed to connect to MondoDB', error)
    process.exit(1)
  }
}

startServer()