const express = require('express');
const router = express.Router();
const { Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const multer = require('multer');

//set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/:spotId/images', requireAuth, upload.single('image'),
async(req, res, next) => {
    const { spotId } = req.params;

    //validate that the spot with spotId exists
    const spot = await Spot.findByPk(spotId);
    if(!spot) {
        const error = new Error('Spot not found');
        error.status = 404;
        throw Error;
    }

    //handle file upload and associate the image with the spot
    const imageBuffer = req.file.buffer;
    //save image to the database
    const newImage = await SpotImage.create({
        spotId: spot.id,
        data: imageBuffer,
    });

    //return info about the added image
    return res.json({ message: 'Image added' });
    next(error);
})

module.exports = router;
