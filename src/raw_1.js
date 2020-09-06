const sharp = require('sharp')
const path = require('path')
const marchingSquares = require('../sticker/marching-squares')
const svgb = require('svgb')

const template = path.join(__dirname, '../assets/method-draw-image.svg')
const inputImage = path.join(__dirname, '../assets/118614881_259104891753524_11646380289130353_n_1.png')

const strokeSize = 50

let width = 0
let height = 0

const makeSvg = async (contours, width = 2400, height = 3600) => {

    const x = strokeSize / 2
    const y = strokeSize / 2


    let startX = x + contours[0].x
    let startY = y + contours[1].y
    let str = `M${startX} ${startY}`
    for (let i = 1; i < contours.length; i++) {
        const endX = x + contours[i].x
        const endY = y + contours[i].y

        str += ` L${endX} ${endY}`
        startX = endX
        startY = endY
    }
    str += ' Z'

    const [resultWidth, resultHeight] = [width, height].map((val) => val + strokeSize)
    console.log(resultWidth, resultHeight)

    const buffer = await svgb.toBuffer(template, {linePath: str, width: resultWidth, height: resultHeight, strokeSize, })

    await sharp(buffer).png().toFile('raw-svg.png')

    return buffer
}

const getStrokeBuffer = async (buffer) => {
    const data = [...buffer]

    // for(let i = 10; i < 100; i++) {
    //     data[i] = 255
    //     console.log(data[i])
    // }
    // const width = 2400
    // const height = 3600
    const {width, height} = await sharp(inputImage).metadata()

    const dataLen = data.length
    console.log(dataLen)

    // console.log(data[5044812])

    const isInside = (x, y) => {
        return x >= 0 && y >= 0 && x < width && y < height
            ? data[(y * width + x) * 4 + 3] > 0
            : false
    }

    let contours = []
    let startPos = -1
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
            startPos = (i + 1) / 4
            break
        }
    }
    if (startPos >= 0) {
        contours = marchingSquares(startPos % width, Math.floor(startPos / width), isInside)

        // console.log(contours)
    } else {
        return false
    }

    const strokeBuffer = await makeSvg(contours, width, height)

    return strokeBuffer
}

const getNextBuffer = async (strokeBuffers) => {
    if (!strokeBuffers.length) return false

    const negateBuffer = await sharp(inputImage).negate().toBuffer()

    const nextBuffer = await sharp(strokeBuffers[0]).composite([
        ...strokeBuffers.map(stroke => ({input: stroke, top: 0, left: 0})),
        {input: negateBuffer, top: strokeSize / 2, left: strokeSize / 2},
    ]).toBuffer()

    const extractBuffer = await sharp(nextBuffer).extract({
        top: strokeSize / 2, left: strokeSize / 2,
        width: width, height: height
    }).toBuffer()

    // await sharp(extractBuffer).negate().png().toFile('negate.png')

    const bufferrr = await sharp(extractBuffer).negate().toBuffer()

    const afterNegateBuffer = await sharp(bufferrr).raw().toBuffer()

    return afterNegateBuffer
}

const getListStrokeBuffer = async (listStroke = []) => {

    if (!listStroke.length) return []

    const newObjectBuffer = await getNextBuffer(listStroke)

    const nextStrokeBuffer = await getStrokeBuffer(newObjectBuffer)

    if (!nextStrokeBuffer) return listStroke

    return getListStrokeBuffer(listStroke.concat([nextStrokeBuffer]))
}

setImmediate(async () => {
    try {
        console.log('alo')
        const buffer = await sharp(inputImage).raw().toBuffer()
        // console.log([...buffer])

        const data = [...buffer]

        // for(let i = 10; i < 100; i++) {
        //     data[i] = 255
        //     console.log(data[i])
        // }
        // const width = 2400
        // const height = 3600
        const {width: _width, height: _height} = await sharp(inputImage).metadata()

        width = _width
        height = _height

        const dataLen = data.length
        console.log(dataLen)

        console.log(data[5044812])

        const isInside = (x, y) => {
            return x >= 0 && y >= 0 && x < width && y < height
                ? data[(y * width + x) * 4 - 1] > 0
                : false
        }

        let contours = []
        let startPos = -1
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) {
                startPos = (i + 1) / 4
                break
            }
        }
        if (startPos >= 0) {
            contours = marchingSquares(startPos % width, Math.floor(startPos / width), isInside)

            // console.log(contours)
        }

        const strokeBuffer = await makeSvg(contours, width, height)

        const [resultWidth, resultHeight] = [width, height].map((val) => val + strokeSize)

        console.log(resultWidth, resultHeight)

        const listStroke = await getListStrokeBuffer([strokeBuffer])

        await sharp(strokeBuffer).composite([
            ...listStroke.slice(1).map(stroke => ({input: stroke, top: 0, left: 0})),
            {input: inputImage, top: strokeSize / 2, left: strokeSize / 2},
        ]).png().toFile('combine-4.png')

        // const nextBuffer = await sharp({
        //     create: {
        //         width: resultWidth,
        //         height: resultHeight,
        //         channels: 4,
        //         background: {
        //             r: 255, g: 255, b: 255
        //         }
        //     }
        // }).composite([
        //     {input: inputImage, top: strokeSize / 2, left: strokeSize / 2},
        //     {input: strokeBuffer, top: 0, left: 0}
        // ]).threshold().raw().toBuffer()

        // await sharp(strokeBuffer).composite([
        //     {input: inputImage, top: strokeSize / 2, left: strokeSize / 2},
        // ]).png().toFile('combine-3.png')


        // contours.forEach((pos) => {
        //     const {x, y} = pos

        //     data[(y * width + x) * 4 - 1] = 255
        // })

        // await sharp(Buffer.from(data), {raw: {width, height, channels: 4}}).png().toFile('raw_1.png')

    } catch (e) {
        console.log(e)

    }
}
)
