const express = require('express')
const router = express.Router()
const {
    createUser,
    displayHomePage,
    getAllUsers,
    createExercise,
    getUserLogs,
} = require('../controller/user-exercises')

router.route('/api/users').post(createUser).get(getAllUsers)
router.route('/').get(displayHomePage)
router.route('/api/users/:_id/exercises').post(createExercise)
router.route('/api/users/:_id/logs').get(getUserLogs)

module.exports = router