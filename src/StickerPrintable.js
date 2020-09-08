const Promise = require('bluebird')

class StickerPrintable {
    constructor(inputImage) {
        this.inputImage = inputImage

        this.contours = []
        this.strokeBuffer = []
    }

    async getListContours(listStroke = [], listContours = [], buffer, skip) {
        if (!listStroke.length) return []

        const newObjectBuffer = await this.getNextBuffer(listStroke, buffer)

        const [nextStrokeBuffer, nextContours] = await this.getStrokeBufferAndContours(newObjectBuffer, skip)

        if (!nextStrokeBuffer) return listContours

        await sharp(nextStrokeBuffer).png().toFile(`stroke-${count}.png`)

        return getListContours(listStroke.concat([nextStrokeBuffer]), listContours.concat([nextContours]), buffer)
    }

    async getStrokeBufferAndContours(buffer, skip) {
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

    async getStrokeBuffer(buffer, skip) {
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

    async getNextBuffer(strokeBuffers, buffer) {
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

    async getListStrokeBuffer(listStroke = [], buffer, skip) {

        if (!listStroke.length) return []

        const newObjectBuffer = await getNextBuffer(listStroke, buffer)

        const nextStrokeBuffer = await getStrokeBuffer(newObjectBuffer, skip)


        if (!nextStrokeBuffer) return listStroke

        await sharp(nextStrokeBuffer).png().toFile(`stroke-${count}.png`)

        return getListStrokeBuffer(listStroke.concat([nextStrokeBuffer]), buffer)
    }
}