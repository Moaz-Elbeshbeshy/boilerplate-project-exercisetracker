const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

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

app.post('/api/users', async function (req, res) {
  let username = req.body.username
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' })
  }

  // removes leading and trailing spaces
  username = username.trim()

  try {
    const newUser = new User({ username })
    const savedUser = await newUser.save()
    return res.status(201).json({ username: savedUser.username, _id: savedUser._id })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json({
    username: data.username,
    _id: data._id
  })
})










startServer()


