const config = require('./utils/config')
const logger = require('./utils/logger')
const app = require('./app')


app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
