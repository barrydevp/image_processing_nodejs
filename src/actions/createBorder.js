const sharp = require('sharp')
const path = require('path')
const svgb = require('svgb')

const Checker = require('../helpers/Checker')
const {lineCommand, svgPath} = require('../helpers/svgUtils')

const template = path.join(__dirname, '../assets/method-draw-image.svg')

const makeSvg = async (contours, {width, height, strokeSize, color, command, blur} = {}, skipPixel = 1) => {
    if (!contours.length) throw new Error('Missing contours')

    if (!width || !height) throw new Error('Missing dimension to make SVG')

    strokeSize = strokeSize || 2
    color = color || '#fff'
    command = Checker.isFunc(command) ? command : lineCommand

    const x = strokeSize / 2
    const y = strokeSize / 2

    const path = svgPath(contours.map((point, i) => {
        if (i !== 0 && i % skipPixel !== 0) return

        const endX = x + point.x
        const endY = y + point.y

        return {x: endX, y: endY}
    }).filter(Boolean), command)

    const [resultWidth, resultHeight] = [width, height].map((val) => val + strokeSize)

    const buffer = await svgb.toBuffer(template, {
        path: path,
        width: resultWidth,
        height: resultHeight,
        stroke_size: strokeSize,
        color,
    })

    if (blur) {
        const shadow = await sharp(buffer).blur(blur).toBuffer()

        return shadow
    }

    return buffer
}

module.exports = makeSvg