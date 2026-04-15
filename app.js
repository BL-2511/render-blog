const express = require('express')
const path = require('path')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const blogRouter = require('./controllers/blog')
// const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')

const mongoose = require('mongoose')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
// const cors = require('cors')
// const mongoSanitize = require('express-mongo-sanitize')
const cookieParser = require('cookie-parser')

const app = express()
app.set('trust proxy', 1)

// app.use(mongoSanitize())

app.use(express.static('dist', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css')
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript')
    }
  }
}))
app.use(express.json())
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'res.cloudinary.com', 'tile.openstreetmap.org', '*.tile.openstreetmap.org'],
      'script-src': ["'self'", "'unsafe-inline'"],
    }
  }
}))
app.use(cookieParser())

// app.use(cors({
//   origin: process.env.FRONTEND_URL, // e.g. 'https://yourdomain.onrender.com'
//   credentials: true,
// }))

app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
// app.use(middleware.userExtractor)

// logger.info('connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

// General limit for all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.'
})

// Stricter limit specifically for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.'
})

app.use('/api/login', loginLimiter)
app.use('/api/', limiter)

app.use('/api/blogs', middleware.userExtractor, middleware.requireAuth, blogRouter)
// app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

app.get('/{*path}', (request, response) => {
  response.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app