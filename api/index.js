import express from 'express'

import router from './routes.js'

const app = express()
const PORT = 8080

app.use(router)

app.listen(PORT, () => {
    console.log(`json-feed-server listening on port ${PORT}`)
})
