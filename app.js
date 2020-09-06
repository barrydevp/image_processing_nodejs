const express = require('express')
const http = require('http')

const app = express()

app.use(express.static('sticker'))
app.get('/ping', (req, res) => {
    res.status(200).send('pong')
})

const server = http.createServer(app)

setImmediate(async () => {
    const port = 9090
    server.listen(port, () => {
        console.log(`[APP_START] on port ${port}`)
    })
})