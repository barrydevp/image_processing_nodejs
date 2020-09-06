const sharp = require('sharp')
const path = require('path')
const trim = require('./trim')

setImmediate(async () => {
    try {
        console.log('alo')
        let buffer = await sharp(path.join(__dirname, '../assets/goav.png')).resize(1290).toBuffer()

        const {width, height} = await sharp(buffer).metadata()

        let w = Math.floor(width * 0.8)

        // console.log(newWidth, width)

        const resized = await sharp(buffer).resize(w).toBuffer()

        const {width: newWidth, height: newHeight} = await sharp(buffer).metadata()

        const negated = await sharp(buffer).negate().toBuffer()

        await sharp(negated).composite([{input: resized, top: (height - newHeight) / 2, left: (width - newWidth) / 2}]).png().toFile('test.png')
    } catch (e) {
        console.log(e)

    }
}
)
