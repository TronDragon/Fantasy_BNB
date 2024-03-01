const express = require('express');
const router = express.Router();
const { Spot, SpotImage, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const multer = require('multer');

//set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//get all spots
router.get('/spots', async (req, res) => {
    const spots = await Spot.findAll();

    return res.json({ spots  });
})

//add an image to a spots based on the spots id
router.post('/spots/:spotId/images', requireAuth, upload.single('image'),
async(req, res, next) => {
    const { spotId } = req.params;

    //validate that the spot with spotId exists
    const spot = await Spot.findByPk(spotId);
    if(!spot) {
        const error = new Error('Spot not found');
        error.status = 404;
        throw error;
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
})

// create new spot
router.post('/spots', requireAuth, async (req,res,next) => {
    const { title, description, price, imageUrl, userId } = req.body;

    const newSpot = await Spot.create({
        title,
        description,
        price,
        imageUrl,
        userId,
    })
    return res.json({ spot: newSpot });
});

//add a spot to the user's spots
router.post('/:spotId/add', requireAuth, async (req, res, next) => {
    const { spotId } = req.params;
    const { userId } = req.body;

    // check if the user owns the spot
    const spot = await Spot.findByPk(spotId);
    if(!spot || spot.userId !== userId) {
        const error = new Error('User does not own the spot');
        error.status = 403;
        throw error;
    }

    const user = await User.findByPk(userId);
    if(user){
        //add spotId to user's spots
        user.spots.push(spotId);
        await user.save();
    } else {
        const error = new Error('User not found');
        error.status = 404;
        throw error
    }
    return res.json({ message: 'Spot added to user' });
})

//delete a spot
router.delete('/spots/:spotId', requireAuth, async (req,res,next) => {
    const { spotId } = req.params;
    const { userId } = req.body;

    const spot = await Spot.findByPk(spotId);
    if(!spot || spot.userId !== userId) {
        const error = new Error('User does not own the spot');
        error.status = 403;
        throw error;
    }

    await spot.delete;

    return res.json({ message: 'Spot deleted successfully'});
})

//get spots by user's id
router.get('/spots/current', requireAuth, async (req,res,next) => {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
        include: {
            model: Spot,
            include: SpotImage,
        },
    });

    if(!user){
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    return res.json({ spots: user.spots });
})

//edit a spot
router.patch('/spots/:spotId', requireAuth, async (req,res,next) => {
    const { spotId } = req.params;
    const { title, description, price, imageUrl } = req.body;

    const spot = await Spot.findByPk(spotId);

    if(!spot) {
        const error = new Error('Spot not found');
        error.status = 404;
        throw error;
    }
    if(spot.userId !== req.user.id) {
        const error = new Error('User does not own the spot');
        error.status = 403;
        throw error;
    }
    //update time
    spot.title = title || spot.title;
    spot.description = description || spot.description;
    spot.price = price || spot.price;
    spot.imageUrl = imageUrl || spot.imageUrl;

    await spot.save();

    return res.json({ spot });
})

//delete an image for a spot
router.delete('/spots/:spotId/images/:imageId/', requireAuth, async (res,req,next) => {
    const { spotId, imageId } = req.params;

    const spot = await Spot.findByPk(spotId);
    if(!spot){
        const error = new Error('Spot not found');
        error.status = 404;
        throw error;
    }
    //check if the user owns the spot
    if(spot.userId !== req.user.id){
        const error = new Error('User does not own the spot');
        error.status = 404;
        throw error;
    }

    const image = await SpotImage.findByPk(imageId);
    if(!image || image.spotId !== spot.id){
        const error = new Error('Image not found for the spot');
        error.status = 404;
        throw error;
    }

    //delete the image from the database
    await image.destroy();

    return res.json({ message: 'Image deleted' });
})

//get details for a spot from an id
router.get('/spots/:spotId', async (req,res,next) => {
    const { spotId } = req.params;

    const spot = await Spot.findByPk(spotId, {
        include: [
            { model: SpotImage, as: 'images' },
            { model: User, attributes: ['id', 'username'] },
        ],
    });

    if(!spot) {
        const error = new Error('Spot not found');
        error.status = 404;
        throw error;

    }

    return res.json({ spot });
})


module.exports = router;
