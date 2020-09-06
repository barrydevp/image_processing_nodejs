const sharp = require('sharp')
const path = require('path')
const trim = require('./trim')

setImmediate(async () => {
        try {
            console.log('alo')
            const buffer = await sharp(path.join(__dirname, '../assets/output.png')).toBuffer()


            const trimmed = await trim(buffer, true)

            await sharp(trimmed).png().toFile('testtrim.png')
        } catch (e) {
            console.log(e)

        }
    }
)