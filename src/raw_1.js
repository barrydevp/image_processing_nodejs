const sharp = require('sharp')
const Promise = require('bluebird')
const path = require('path')
const marchingSquares = require('../sticker/marching-squares')
const svgb = require('svgb')

const template = path.join(__dirname, '../assets/method-draw-image.svg')
// const nameInput = '118614881_259104891753524_11646380289130353_n'
const nameInput = 'goav'
const inputImage = path.join(__dirname, `../assets/${nameInput}.png`)

let strokeSize = 140
let color = '#A9A9A9'

let width = 0
let height = 0

let count = 0

// Properties of a line 
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: l, angle: a }: properties of the line
const line = (pointA, pointB) => {
    const lengthX = pointB.x - pointA.x
    const lengthY = pointB.y - pointA.y
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    }
}

// Position of a control point 
// I:  - current (array) [x, y]: current point coordinates
//     - previous (array) [x, y]: previous point coordinates
//     - next (array) [x, y]: next point coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: a tuple of coordinates
const controlPoint = (current, previous, next, reverse) => {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current
    const n = next || current
    // The smoothing ratio
    const smoothing = 0.8
    // Properties of the opposed-line
    const o = line(p, n)
    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.length * smoothing
    // The control point position is relative to the current point
    const x = current.x + Math.cos(angle) * length
    const y = current.y + Math.sin(angle) * length
    return {x, y}
}

// Create the bezier curve command 
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
const bezierCommand = (point, i, a) => {
    // start control point
    const {x: cpsX, y: cpsY} = controlPoint(a[i - 1], a[i - 2], point)
    // end control point
    const {x: cpeX, y: cpeY} = controlPoint(point, a[i - 1], a[i + 1], true)
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x},${point.y}`
}

// Svg path line command
// I:  - point (array) [x, y]: coordinates
// O:  - (string) 'L x,y': svg line command
const lineCommand = point => `L ${point.x} ${point.y}`

// Render the svg <path> element 
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) a svg path command
// O:  - (string): a Svg <path> element
const svgPath = (points, command) => {
    // build the d attributes by looping over the points
    const d = points.reduce((acc, point, i, a) => {

        const {x, y} = point

        return i === 0
            // if first point
            ? `M ${x},${y}`
            // else
            : `${acc} ${command(point, i, a)}`
    }, '')

    return `${d} Z`
}


const makeSvg = async (contours, skip = 1, width = 2400, height = 3600) => {

    const x = strokeSize / 2
    const y = strokeSize / 2


    let startX = x + contours[0].x
    let startY = y + contours[0].y
    let str = `M ${startX},${startY}`
    str = svgPath(contours.map((point, i) => {
        if (i === 0) return
        if (i % skip !== 0) return

        const endX = x + point.x
        const endY = y + point.y

        return {x: endX, y: endY}
    }).filter(Boolean), (skip > 30) ? lineCommand : bezierCommand)

    // console.log(str)
    // for (let i = 1; i < contours.length; i++) {

    //     str += ` L ${endX},${endY}`
    //     startX = endX
    //     startY = endY
    // }
    // str += ' Z'

    const [resultWidth, resultHeight] = [width, height].map((val) => val + strokeSize)
    console.log(resultWidth, resultHeight)

    const buffer = await svgb.toBuffer(template, {
        linePath: str,
        width: resultWidth,
        height: resultHeight,
        strokeSize,
        color
    })

    return buffer

    // const shadow = await sharp(buffer).blur(5).toBuffer()

    // return shadow
}

const getStrokeBufferAndContours = async (buffer, skip) => {
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
        return [false, false]
    }

    const strokeBuffer = await makeSvg(contours, skip, width, height)

    return [strokeBuffer, contours]
}

const getStrokeBuffer = async (buffer, skip) => {
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

    const strokeBuffer = await makeSvg(contours, skip, width, height)

    return strokeBuffer
}

const getNextBuffer = async (strokeBuffers, buffer) => {
    if (!strokeBuffers.length) return false

    const negateBuffer = await sharp(buffer).negate().toBuffer()
    // await sharp(buffer).negate().toFile('nagate-one.png')
    // await sharp(buffer).png().toFile('after-negate.png')
    // await sharp(negateBuffer).png().toFile('negate-two.png')
    // console.log('saved negate-one.png')

    const compositeArr = strokeBuffers.length > 1 && strokeBuffers.slice(1).map(stroke => ({
        input: stroke,
        top: 0,
        left: 0
    })) || []

    compositeArr.push(
        {input: negateBuffer, top: strokeSize / 2, left: strokeSize / 2}
    )

    // console.log(compositeArr)

    const nextBuffer = await sharp(strokeBuffers[0]).composite(compositeArr).toBuffer()

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

const getListStrokeBuffer = async (listStroke = [], buffer, skip) => {

    if (!listStroke.length) return []

    const newObjectBuffer = await getNextBuffer(listStroke, buffer)

    const nextStrokeBuffer = await getStrokeBuffer(newObjectBuffer, skip)


    if (!nextStrokeBuffer) return listStroke

    await sharp(nextStrokeBuffer).png().toFile(`stroke-${count}.png`)

    return getListStrokeBuffer(listStroke.concat([nextStrokeBuffer]), buffer)
}

const getListContours = async (listStroke = [], listContours = [], buffer, skip) => {

    if (!listStroke.length) return []

    const newObjectBuffer = await getNextBuffer(listStroke, buffer)

    const [nextStrokeBuffer, nextContours] = await getStrokeBufferAndContours(newObjectBuffer, skip)

    if (!nextStrokeBuffer) return listContours

    await sharp(nextStrokeBuffer).png().toFile(`stroke-${count}.png`)

    return getListContours(listStroke.concat([nextStrokeBuffer]), listContours.concat([nextContours]), buffer)
}

const gen = async (buffer, skip, _strokeSize) => {

    strokeSize = 10

    console.log('in gen')

    const {width: _w, height: _h} = await sharp(buffer).metadata()

    width = _w
    height = _h

    const bufferThreshold = await sharp(buffer).threshold(255).toBuffer()

    // await sharp(bufferThreshold).png().toFile('threshold.png')

    const rawBuffer = await sharp(bufferThreshold).raw().toBuffer()

    const data = [...rawBuffer]

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
    console.log('startPos', startPos)
    if (startPos >= 0) {
        contours = marchingSquares(startPos % width, Math.floor(startPos / width), isInside)

        // console.log(contours)
    }

    console.log('make svg, ', width, height)

    const strokeBuffer = await makeSvg(contours, skip, width, height)

    const [resultWidth, resultHeight] = [width, height].map((val) => val + strokeSize)

    console.log(resultWidth, resultHeight)

    await sharp(strokeBuffer).png().toFile(`stroke-${count}.png`)

    // const listStroke = await getListStrokeBuffer([strokeBuffer], bufferThreshold, skip)
    const listContours = await getListContours([strokeBuffer], [contours], bufferThreshold, skip)

    // console.log(listContours)

    strokeSize = _strokeSize

    const listStroke = await Promise.map(listContours, async (_contours, i) => {
        const svgBuf = await makeSvg(_contours, skip, width, height)

        // await sharp(svgBuf).png().toFile('svgBuf.png')

        return svgBuf
    }, {concurrency: 1})

    const background = await sharp(listStroke[0]).composite([
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
            // color = 'red'

            const background = await gen(buffer, 1, 100)

            await sharp(background).png().toFile(`${nameInput}_gen.png`)

            // color = 'red'
            // color = '#A9A9A9'
            color = '#fff'
            strokeSize = 10

            let result = await gen(background, 1, 10)

            color = '#A9A9A9'
            strokeSize = 20

            result = await gen(result, 1, 10)

            await sharp(result).png().toFile(`${nameInput}_result.png`)

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
