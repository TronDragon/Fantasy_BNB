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
    //get parameters
    const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

    //validate parameters
    if(page < 1 || size < 1 || minPrice < 0 || maxPrice < 0){
        return res.status(400).json({
            message: 'Bad Request',
            errors: {
                page: "Page must be greater than or equal to 1",
                size: "Size must be greater than or equal to 1",
                maxLat: "Maximum latitude is invalid",
                minLat: "Minimum latitude is invalid",
                minLng: "Maximum longitude is invalid",
                maxLng: "Minimum longitude is invalid",
                minPrice: "Minimum price must be greater than or equal to 0",
                maxPrice: "Maximum price must be greater than or equal to 0"
            }
        })
    }
    const queryOptions = {
        offset: (page - 1) * size,
        limit: size,
        where: {
            lat: { [Op.between]: [minLat, maxLat] },
            lng: { [Op.between]: [minLng, maxLng] },
            price: { [Op.between]: [minPrice, maxPrice] },
        },
        include: [
            {
                model: SpotImage,
                as: 'images',
                where: { preview: true },
                required: false,
            }
        ]
    }
    const spots = await Spot.findAll(queryOptions);

    return res.json({
        Spots: spots,
        page: parseInt(page),
        size: parseInt(size)
     });
})

//add an image to a spots based on the spots id
router.post('/spots/:spotId/images', requireAuth, upload.single('image'),
async(req, res, next) => {
    const { spotId } = req.params;
    const { url, preview } = req.body;

    //validate that the spot with spotId exists
    const spot = await Spot.findByPk(spotId);
    if(!spot) {
        const error = new Error("Spot couldn't be found");
        error.status = 404;
        throw error;
    }
    //require proper authorization
    if(spot.ownerID !== req.user.id){
        const error = new Error('User does not own this spot')
        error.status = 403;
        throw error;
    }
    //save image to the database
    const newImage = await SpotImage.create({
        spotId: spot.id,
        url,
        preview,
    });

    //return info about the added image
    return res.json({ message: 'Image added' });
})

// create new spot
router.post('/spots', requireAuth, async (req,res,next) => {
    const {
        address, city, state, country, latitude,
        longitude, name, description, price
            } = req.body;

    const newSpot = await Spot.create({
        address,
        city,
        state,
        country,
        latitude,
        longitude,
        name,
        description,
        price,
    })
    return res.status(201).json({ spot: newSpot });
});

// //add a spot to the user's spots
// router.post('/:spotId/add', requireAuth, async (req, res, next) => {
//     const { spotId } = req.params;
//     const { userId } = req.body;

//     // check if the user owns the spot
//     const spot = await Spot.findByPk(spotId);
//     if(!spot || spot.userId !== userId) {
//         const error = new Error('User does not own the spot');
//         error.status = 403;
//         throw error;
//     }

//     const user = await User.findByPk(userId);
//     if(user){
//         //add spotId to user's spots
//         user.spots.push(spotId);
//         await user.save();
//     } else {
//         const error = new Error('User not found');
//         error.status = 404;
//         throw error
//     }
//     return res.json({ message: 'Spot added to user' });
// })

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
    const { address, city, state, country, latitude,
        longitude, name, description, price } = req.body;

    const spot = await Spot.findByPk(spotId);

    if(!spot) {
        const error = new Error('Spot not found');
        error.status = 404;
        throw error;
    }
    if(spot.ownerID !== req.user.id) {
        const error = new Error('User does not own the spot');
        error.status = 403;
        throw error;
    }
    //update time
    spot.address = address || spot.address;
    spot.city = city || spot.city;
    spot.state = state || spot.state;
    spot.country = country || spot.country;
    spot.latitude = latitude || spot.latitude;
    spot.longitude = longitude || spot.longitude;
    spot.name = name || spot.name;
    spot.description = description || spot.description;
    spot.price = price || spot.price;

    await spot.save();

    return res.json({ spot });
})

//delete an image for a spot
router.delete('/spot-images/:imageId', requireAuth, async (res,req,next) => {
    const { imageId } = req.params;
    const { userId } = req.user;

    const spotImage = await SpotImage.findByPk(imageId, {
        include: {
            model: Spot,
            where: { ownerID: userId },
        },
    })

    if(!spotImage){
        return res.status(404).json({ message: "Spot Image couldn't be found" })
    };

    //delete the image
    await spotImage.destroy();

    return res.json({ message: "Successfully deleted" })
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
