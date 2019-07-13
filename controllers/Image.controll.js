const multer = require('multer')
const conf =  multer({ dest: 'data/' })

const path = require('path')
const fs = require('fs')

// resize, reshap
const sharp = require('sharp')
const transform = sharp()

class Image {
    SingleFile(name) {
        return conf.single(name)
    }

    async ImgDir(fileName) {
        return path.join(__dirname, '../', fileName)
    }

    resize(path, width, height, format = 'png') {
        const readStream = fs.createReadStream(path)
        let transform = sharp()
      
        if (format) {
          transform = transform.toFormat(format)
        }
      
        if (width || height) {
          transform = transform.resize(width, height)
        }
      
        return readStream.pipe(transform)
      }
}

module.exports = new Image()