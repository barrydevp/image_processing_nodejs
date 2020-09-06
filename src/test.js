const sharp = require('sharp')
const path = require('path')
const trim = require('./trim')

const test = async () => {
    const OUTPUT_BACKGROUND = '#bada55'
    const SHADOW_MARGIN = 40
    const OUTPUT_WIDTH = 1300 + SHADOW_MARGIN * 2
    const OUTPUT_HEIGHT = 1392 + SHADOW_MARGIN * 2
    const SHADOW_BLUR = 15
    const SHADOW_OFFSET = 6
    const SHADOW_OPACITY = 0.3

    const stream = await sharp(path.join(__dirname, '../assets/goav.png'))
    const {width, height} = await stream.metadata()
    console.log(width, height)

    const shadow = await sharp(
        Buffer.from(`
    <svg
      width="${width + SHADOW_MARGIN * 2}"
      height="${height + SHADOW_MARGIN * 2}"
    >
      <rect
        width="${width}"
        height="${height}"
        x="${SHADOW_MARGIN}"
        y="${SHADOW_MARGIN + SHADOW_OFFSET}"
        fill="rgba(0, 0, 0, ${SHADOW_OPACITY})"
      />
    </svg>`)
    )
        .blur(SHADOW_BLUR)
        .toBuffer()

    const image = await stream
        .resize({
            height,
            width,
        })
        .toBuffer()

    // await sharp({
    //     create: {
    //         width: OUTPUT_WIDTH,
    //         height: OUTPUT_HEIGHT,
    //         channels: 3,
    //         background: OUTPUT_BACKGROUND,
    //     },
    // })
    await sharp(shadow)
        .composite([
            // {input: shadow, blend: 'multiply'},
            {input: image, blend: 'over'},
        ])
        .png()
        .toFile('test.png')
}
setImmediate(async () => {
    try {
        console.log('alo')
        await test()
        // let buffer = await sharp(path.join(__dirname, '../assets/goav.png')).resize(1290).toBuffer()

        // const {width, height} = await sharp(buffer).metadata()

        // let w = Math.floor(width * 0.8)

        // // console.log(newWidth, width)

        // const resized = await sharp(buffer).resize(w).toBuffer()

        // const {width: newWidth, height: newHeight} = await sharp(buffer).metadata()

        // const negated = await sharp(buffer).negate().toBuffer()

        // await sharp(negated).composite([{input: resized, top: (height - newHeight) / 2, left: (width - newWidth) / 2}]).png().toFile('test.png')
    } catch (e) {
        console.log(e)

    }
}
)
