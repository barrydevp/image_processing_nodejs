// const marchingSquares = require('marching-squares')
// const ImageStroke = require('image-stroke')
//
// // Choose one of these methods
// const rotate = require('image-stroke/lib/method-rotate')
// const distance = require('image-stroke/lib/method-distance')
// const contour = require('image-stroke/lib/method-contour')
// const rotateByGL = require('image-stroke/lib/method-rotate-by-gl')

import ImageStroke from './image-stroke/lib'

// Choose one of these methods
// import rotate from './image-stroke/lib/method-rotate'
// import distance from './image-stroke/lib/method-distance'
import contour from './image-stroke/lib/method-contour'

const imageStroke = new ImageStroke()

// Just use it
imageStroke.use(contour)

const image = new Image()
image.src = './goav.png'

image.onload = () => {
    // Get result
    const resultCanvas = imageStroke.make(image, {
        thickness: 50,
        color: 'red'
    })

    console.log('hello')

    document.getElementById('root').appendChild(resultCanvas)

}

// console.log(resultCanvas)