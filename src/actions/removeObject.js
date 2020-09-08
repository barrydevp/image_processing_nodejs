const sharp = require('sharp')

const removeBuffer = async (sourceBuffer, destBuffer) => {
    if (!sourceBuffer || !destBuffer) throw new Error('Invalid buffer to remove')

    const nextBuffer = await sharp(destBuffer).composite({input: sourceBuffer, blend}).toBuffer()

    // await sharp(nextBuffer).png().toFile('strokeOut.png')

    const extractBuffer = await sharp(nextBuffer).extract({
        top: strokeSize / 2, left: strokeSize / 2,
        width: width, height: height
    }).toBuffer()

    // await sharp(extractBuffer).negate().png().toFile('negate.png')
    // console.log('saved negate.png')

    const bufferrr = await sharp(extractBuffer).negate().toBuffer()

    // await sharp(extractBuffer).png().toFile(`extractBuffer-debug${count}.png`)

    count++

    const afterNegateBuffer = await sharp(bufferrr).raw().toBuffer()

    return afterNegateBuffer
}

module.exports = removeBuffer
