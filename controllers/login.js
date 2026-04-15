const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')


loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // token expires in 60*60 seconds, that is, in one hour
  const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  response.cookie('token', token, {
    httpOnly: true,     // not accessible via JavaScript
    secure: true,       // only sent over HTTPS
    sameSite: 'strict', // CSRF protection
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  })

  response
    .status(200)
    .send({ 
      // token, 
      username: user.username, 
      name: user.name,
      permissions: user.permissions 
    })
})


loginRouter.delete('/', (req, res) => {
  res.clearCookie('token')
  res.status(204).end()
})

module.exports = loginRouter