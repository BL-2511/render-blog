const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')


userRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    // console.log(request.body)

    if (password.length < 3) {
        return response.status(400).json({ error: 'pasword short' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        permissions,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs')

    response.json(users)
})

module.exports = userRouter