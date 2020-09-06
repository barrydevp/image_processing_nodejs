const sharp = require('sharp')
const path = require('path')
const marchingSquares = require('../sticker/marching-squares')
const svgb = require('svgb')

const template = path.join(__dirname, '../assets/method-draw-image.svg')

const strokeSize = 60

const makeSvg = async (contours, width = 2400, height = 3600) => {

    const x = strokeSize / 2
    const y = strokeSize / 2


    let startX = x + contours[0].x
    let startY = y + contours[1].y
    let str = `M${startX} ${startY}`
    for (let i = 1; i < contours.length; i++) {
        const endX = x + contours[i].x
        const endY = y + contours[i].y

        str += `L${endX} ${endY}`
        startX = endX
        startY = endY
    }

    const [resultWidth, resultHeight] = [width, height].map((val) => val + strokeSize)

    const buffer = await svgb.toBuffer(template, {linePath: str, width: resultWidth, height: resultHeight, strokeSize, })

    await sharp(buffer).png().toFile('raw-svg.png')

    return buffer
}

setImmediate(async () => {
        try {
            console.log('alo')
            const buffer = await sharp(path.join(__dirname, '../assets/118614881_259104891753524_11646380289130353_n.png')).raw().toBuffer()
            // console.log([...buffer])

            const data = [...buffer]

            // for(let i = 10; i < 100; i++) {
            //     data[i] = 255
            //     console.log(data[i])
            // }
            const width = 2400
            const height = 3600

            const dataLen = data.length
            console.log(dataLen)

            console.log(data[5044812])

            const isInside = (x, y) => {
                return x >= 0 && y >= 0 && x < width && y < height
                    ? data[(y * width + x) * 4 - 1] > 100
                    : false
            }

            let contours = []
            let startPos = -1
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 100) {
                    startPos = (i + 1) / 4
                    break
                }
            }
            if (startPos >= 0) {
                contours = marchingSquares(startPos % width, Math.floor(startPos / width), isInside)

                // console.log(contours)
            }

            const strokeBuffer = await makeSvg(contours)

            await sharp(strokeBuffer).composite([
                {input: path.join(__dirname, '../assets/118614881_259104891753524_11646380289130353_n.png'), top: strokeSize / 2, left: strokeSize / 2}
            ]).png().toFile('combine-1.png')

        } catch (e) {
            console.log(e)

        }
    }
)