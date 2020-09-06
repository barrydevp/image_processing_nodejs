const sharp = require('sharp')
const path = require('path')
const marchingSquares = require('../sticker/marching-squares')
const svgb = require('svgb')

const template = path.join(__dirname, '../assets/method-draw-image.svg')
const inputImage = path.join(__dirname, '../assets/118614881_259104891753524_11646380289130353_n.png')

let strokeSize = 80
let color = '#A9A9A9'

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

    const buffer = await svgb.toBuffer(template, {linePath: str, width: resultWidth, height: resultHeight, strokeSize, color})

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

const getNextBuffer = async (strokeBuffers, buffer) => {
    if (!strokeBuffers.length) return false

    const negateBuffer = await sharp(buffer).negate().toBuffer()

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

const getListStrokeBuffer = async (listStroke = [], buffer) => {

    if (!listStroke.length) return []

    const newObjectBuffer = await getNextBuffer(listStroke, buffer)

    const nextStrokeBuffer = await getStrokeBuffer(newObjectBuffer)

    if (!nextStrokeBuffer) return listStroke

    return getListStrokeBuffer(listStroke.concat([nextStrokeBuffer]), buffer)
}

const gen = async (buffer) => {

    console.log('in gen')

    const {width: _w, height: _h} = await sharp(buffer).metadata()

    width = _w
    height = _h

    const rawBuffer = await sharp(buffer).raw().toBuffer()

    const data = [...rawBuffer]

    const dataLen = data.length
    console.log(dataLen)

    console.log(data[5044812])

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
    console.log('startPos', startPos)
    if (startPos >= 0) {
        contours = marchingSquares(startPos % width, Math.floor(startPos / width), isInside)

        // console.log(contours)
    }

    console.log('make svg, ', width, height)

    const strokeBuffer = await makeSvg(contours, width, height)

    const [resultWidth, resultHeight] = [width, height].map((val) => val + strokeSize)

    console.log(resultWidth, resultHeight)

    const listStroke = await getListStrokeBuffer([strokeBuffer], buffer)

    const background = await sharp(strokeBuffer).composite([
        ...listStroke.slice(1).map(stroke => ({input: stroke, top: 0, left: 0})),
        {input: buffer, top: strokeSize / 2, left: strokeSize / 2},
    ]).toBuffer()

    return background
}

setImmediate(async () => {
    try {
        console.log('alo')
        const buffer = await sharp(inputImage).toBuffer()
        // console.log([...buffer])
        //

        color = '#fff'
        strokeSize = 100

        const background = await gen(buffer)

        await sharp(background).png().toFile('raw_gen.png')

        color = '#A9A9A9'
        strokeSize = 30

        const result = await gen(background)

        await sharp(result).png().toFile('raw_result.png')

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
