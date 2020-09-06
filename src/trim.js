const jimp = require('jimp')
const sharp = require('sharp')


module.exports = async (buffer, trim = false) => {
    if (!trim || typeof trim !== 'boolean') return buffer

    const image = await jimp.read(buffer)
    await image.autocrop({tolerance: 0.1})

    return new Promise((resolve, reject) => {
        image.getBuffer('image/png', async (err, _buffer) => {
            if (err) return reject(err)

            console.log('aaa')

            try {
                const result = await sharp(_buffer)
                    .png({quality: 100})
                    .toBuffer()

                return resolve(result)
            } catch (e) {
                return reject(e)
            }
        })
    })
}