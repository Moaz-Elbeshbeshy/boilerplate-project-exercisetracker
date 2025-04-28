const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

// middlewares
app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// coonect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })

  } catch (error) {
    console.error('Error starting server:', error)
  }
}

// Schema and Model to store user and exercise data
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
})
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
})
const User = mongoose.model('User', userSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)


// Get all users and their ids
app.get('/api/users', async function (req, res) {
  try {
    const allUsers = await User.find({}, 'username _id')
    return res.status(200).json(allUsers)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})


app.get('/api/users/:_id/logs', async function (req, res) {
  const { from, to, limit } = req.query
  const userId = req.params._id
  //validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' })
  }
  try {
    const matchingUser = await User.findById(userId)
    if (!matchingUser) {
      return res.status(404).json({ error: 'User not found' })
    }
    let query = { userId: matchingUser._id }
    if (from) {
      const fromDate = new Date(from)
      if (isNaN(fromDate)) {
        return res.status(400).json({ error: 'Invalid from date' })
      }
      query.date = { $gte: fromDate }
    }
    if (to) {
      const toDate = new Date(to)
      if (isNaN(toDate)) {
        return res.status(400).json({ error: 'Invalid to date' })
      }
      query.date = query.date ? { ...query.date, $lte: toDate } : { $lte: toDate }
    }
    const exercises = await Exercise.find(query).limit(limit ? parseInt(limit) : 0)
    if (!exercises) {
      return res.status(404).json({ error: 'No exercises found' })
    }
    return res.status(200).json({
      username: matchingUser.username,
      count: exercises.length,
      _id: matchingUser._id,
      log: exercises.map(exercises => ({
        description: exercises.description,
        duration: exercises.duration,
        date: exercises.date.toDateString()
      }))
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})





app.post('/api/users/:_id/exercises', async function (req, res) {
  const { description, duration, date } = req.body
  // validate description and duration
  if (!description || !duration || description.trim() === '' || duration <= 0) {
    return res.status(400).json({ error: 'Description and duration are required' })
  }

  // validate date
  let exerciseDate = date ? new Date(date) : new Date()
  if (isNaN(exerciseDate)) {
    exerciseDate = new Date()
  }
  // validate userId
  const userId = req.params._id
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' })
  }
  try {
    matchingUser = await User.findById(userId)
    if (!matchingUser) {
      return res.status(404).json({ error: 'User not found' })
    }
    const newExercise = await new Exercise({
      userId: matchingUser._id,
      description: description,
      duration: duration,
      date: exerciseDate
    }).save()
    return res.status(201).json({
      username: matchingUser.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: matchingUser._id
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})





// Add a new user to database
app.post('/api/users', async function (req, res) {
  let username = req.body.username
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' })
  }

  // removes leading and trailing spaces
  username = username.trim()

  try {
    const newUser = await new User({ username }).save()
    return res.status(201).json({ username: newUser.username, _id: newUser._id })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    return res.status(500).json({ error: error.message })
  }
})










startServer()


