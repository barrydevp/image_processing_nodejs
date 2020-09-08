const sharp = require('sharp')
const DPIToPPM = require('../helpers/DPIToPPM')

module.exports = async (buffer, pathFile, DPI = 100) => {
    const pixelPerMini = DPIToPPM(DPI)

    const info = await sharp(buffer)
        .withMetadata()
        .tiff({
            quality: 100,
            xres: pixelPerMini,
            yres: pixelPerMini,
            compression: 'lzw'
        })
        .toFile(pathFile)

    console.log('Export to tiff with DPI:', DPI)

    return pathFile
}
