const sharp = require('sharp')
const path = require('path')
const trim = require('./trim')

module.exports = async () => {
    console.log('start')
    const buffer = await sharp(path.join(__dirname, '../assets/goav.png')).toBuffer()

    const result = await sharp(buffer).threshold().png().toFile('test.png')
    const result1 = await sharp(buffer).trim().png().toBuffer()
    const buffer1 = await sharp(result1).negate().toFile('negate.png')
    const bufferNegate = await sharp('negate.png').toBuffer()

    const {width, height} = await sharp(bufferNegate).metadata()

    // const trimmed = await trim(buffer, true)

    // console.log(await sharp(trimmed).metadata())

    // await sharp(trimmed).toFile('trimmed.png')

    let resizeWidth = Math.floor(width * 0.9)
    resizeWidth = resizeWidth + resizeWidth % 2
    let resizeHeight = resizeWidth / width * height + (height - (resizeWidth / width * height)) % 2

    console.log(resizeWidth)
    console.log(resizeHeight)

    const negateBuffer = await sharp('negate.png').toBuffer()

    const resizeBuffer = await sharp(result1).resize({width: resizeWidth, height: resizeHeight}).toBuffer()

    const {width: newWidth, height: newHeight} = await sharp(resizeBuffer).metadata()

    await sharp(resizeBuffer).png().toFile('resize.png')
    console.log(newWidth, newHeight)
    console.log((width - newWidth) / 2, (height - newHeight) / 2)

    const combine = await sharp(negateBuffer).composite([
        {input: resizeBuffer, top: (height - newHeight) / 2, left: (width - newWidth) / 2}
    ]).png().toFile('combine.png')

    // console.log(result)
    // console.log(result1)

}