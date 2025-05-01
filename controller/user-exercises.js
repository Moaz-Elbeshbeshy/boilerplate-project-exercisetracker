const { User, Exercise } = require('../models/user-exercises')
const asyncWrapper = require('../middleware/async')
const path = require('path')
const mongoose = require('mongoose')

// display home page
const displayHomePage = asyncWrapper(async (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'))
})

// create new user
const createUser = asyncWrapper(async (req, res) => {
    const { username } = req.body
    const newUser = await User.create({ username })
    res.status(200).json({ username: newUser.username, _id: newUser._id })
})

// get list of all users
const getAllUsers = asyncWrapper(async (req, res) => {
    const allUsers = await User.find({}, 'username _id')
    res.status(200).json(allUsers)
})

// create exercise
const createExercise = asyncWrapper(async (req, res) => {
    const id = req.params._id
    let { date, duration, description } = req.body

    // verify there is description and duration
    if (!duration || String(duration).trim() === '' || !description || description.trim() === '') {
        return res.status(400).json({ error: 'provide duration and description' })
    }

    // verify duration is a number
    if (isNaN(duration)) {
        return res.status(400).json({ error: 'Invalid duration, must enter a number' })
    }

    // use current time if no date is provided
    if (!date) {
        date = new Date()
    } else {
        if (/^\d+$/.test(date)) {  // check if it's a number (UNIX timestamp in string form)
            date = new Date(parseInt(date))  // Convert string to integer and then to Date
        } else {
            date = new Date(date)  // This will parse other date formats (ISO, UTC, etc.)
        }
    }

    // Validate that the date is a valid Date object
    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date' })  // Invalid date check
    }

    const user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }

    const newExercise = await Exercise.create({ description, duration, date, userId: user._id })
    res.status(200).json({
        _id: user._id,
        username: user.username,
        date: date.toDateString(),
        duration: newExercise.duration,
        description: newExercise.description
    })
})

const getUserLogs = asyncWrapper(async (req, res) => {
    const id = req.params._id
    const { from, to, limit } = req.query
    if (!id) {
        return res.status(400).json({ error: 'No ID provided' })
    } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID' })
    }

    const user = await User.findById(id)
    if (!user) {
        return res.status(404).json({ error: 'No user found with this ID' })
    }

    let query = { userId: user._id }
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


    const allExercises = await Exercise.find(query).limit(limit ? parseInt(limit) : 0)
    if (!allExercises) {
        return res.status(404).json({ error: 'No exercises found' })
    }
    return res.status(200).json({
        _id: id,
        username: user.username,
        count: Number(allExercises.length),
        log: allExercises.map(allExercises => ({
            description: allExercises.description,
            duration: allExercises.duration,
            date: allExercises.date ? allExercises.date.toDateString() : 'Invalid Date'
        }))
    })
})

module.exports = {
    createUser,
    displayHomePage,
    getAllUsers,
    createExercise,
    getUserLogs,
}