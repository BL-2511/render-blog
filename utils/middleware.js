const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require("../models/user")


const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  // logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 
  else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }
  else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  }
  else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {

  const cookieToken = request.cookies?.token
  const headerToken = request.get('authorization')?.replace('Bearer ', '')
  
  request.token = cookieToken || headerToken || null
  next()
}


const userExtractor = async (request, response, next) => {

  const token = request.token

  console.log('token:', token)  // is token being extracted?
  console.log('cookies:', request.cookies)  // is the cookie arriving?

  // logger.info('token', token)

  if (token) {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    // without the await, you only return a promise
    const user = await User.findById(decodedToken.id)

    if (!user) {
      return response.status(400).json({ error: 'userId missing or not valid' })
    }

    request.user = user
    // logger.info('request.user', request.user)
  }
  else {
    logger.info('token failed?')
    request.user = null
  }

  next()
}

const requireAuth = (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({ error: 'authentication required' })
  }
  next()
}


module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  requireAuth,

}