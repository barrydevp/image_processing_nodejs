const QRCode = require('qrcode')
const sharp = require('sharp')
const fs = require('fs-extra')
const svgb = require('svgb')
const path = require('path')

const template = path.join(__dirname, '../assets/batch-info.svg')
const DPI = 150

const _exportToTif = async (buffer, pathFile) => {
    const pixelPerMini = DPI / 2.54

    return sharp(buffer)
        .flop(true)
        .tiff({
            quality: 100,
            xres: pixelPerMini,
            yres: pixelPerMini,
            compression: 'lzw'
        })
        .toFile(pathFile)
}

const genQRCode = (batchName) => {
    return QRCode.toBuffer(batchName, {
        width: 118,
        type: 'png',
        margin: 0,
    })
}

const getTemplateBuffer = async () => {
    const content = await fs.readFile(template, {encoding: 'utf8'})

    return Buffer.from(content)
}

const genInfo = async (info, pathFile = '') => {
    if (!pathFile) throw new Error('Path file output is required.')

    const {
        name,
        created_at,
        total_orders,
        note,
        product_types,
        user_create
    } = Object.assign({}, info)

    const vProductTypes = Array.isArray(product_types) ? product_types : []

    const vArgs = {
        name: (name || '').toString().trim().toUpperCase(),
        user_create: (user_create || '').toString().trim(),
        created_at: (created_at || '').toString().trim(),
        total_orders: (total_orders || '').toString().trim(),
        note: (note || '').trim(),
        product_types: vProductTypes.join(', ')
    }

    const buffer = await svgb.toBuffer(template, vArgs)

    return _exportToTif(buffer, pathFile)
}

const _mapLevels = {
    'medium': '#ffffff',
    'highest': '#ff2500',
    'high': '#FFD300',
}

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

const _genLevelLabel = (level) => {
    const color = _mapLevels[level] || _mapLevels['medium']

    const rgb = hexToRgb(color)

    console.log(rgb)

    return sharp({
        create: {
            width: 200,
            height: 200,
            channels: 4,
            background: Object.assign({r: 255, g: 0, b: 0, alpha: 1}, rgb),
        }
    }).png().toBuffer()
}

setImmediate(async () => {
    try {
        const template = await getTemplateBuffer()

        console.log('template ok')

        const qrBuffer = await genQRCode('B-12345')

        console.log('qr ok')

        const labelBuffer = await _genLevelLabel('')

        console.log('label level ok')

        const infoBuffer = await sharp(template)
            .png({quality: 100})
            .composite([
                {
                    input: qrBuffer,
                    top: 512 - 118,
                    left: 800 - 118,
                },
                {
                    input: labelBuffer,
                    top: 0,
                    left: 800 - 200,
                }
            ])
            .png({quality: 100})
            .toBuffer()


        await _exportToTif(infoBuffer, './info.tiff')

        console.log('done')
    } catch (e) {
        console.log(e)
    }
})
