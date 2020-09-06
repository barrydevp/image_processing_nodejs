const path = require('path')

module.exports = {
    entry: './sticker/index.js',
    output: {
        path: path.resolve(__dirname, 'sticker'),
        filename: 'index.bundle.js'
    }
}