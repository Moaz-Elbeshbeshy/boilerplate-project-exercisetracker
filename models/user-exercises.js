const mongoose = require('mongoose')

// Creating the Schemas
let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
}, {
    versionKey: false    // this disables the __v field
})

let exerciseSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    versionKey: false    // this disables the __v field
})

// Creating the models
const User = mongoose.model('User', userSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)

module.exports = {
    User,
    Exercise
}