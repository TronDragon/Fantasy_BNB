const express = require('express');
const router = express.Router();
const { Booking, Spot } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');

//get all bookings for a user by ID
router.get('/bookings/current', requireAuth, async (req,res) => {
    const { userId } = req.params;

    const bookings = await Booking.findAll({
        where: { userId },
        include: [
            {
                model: Spot,
                attributes: [
                    'id', 'ownerId', 'address', 'city', 'state',
                    'country', 'lat', 'lang', 'name', 'price', 'previewImage'
                ]
            }
        ]
    });
    return res.json({ Bookings: bookings });
});

//get a booking by ID
router.get('/spots/:spotId/bookings', requireAuth, async (req,res) => {
    const { spotId } = req.params;
    const { userId } = req.user;

    const spot = await Spot.findByPk(spotId);

    if(!spot){
        return res.status(404).json({ message: 'Spot not found' });
    }

    let bookings;

    //check to see if the user is not the owner
    if(spot.ownerId !== userId){
        bookings = await Booking.findAll({
            where: { spotId },
            attributes: ['startDate', 'endDate']
        });
    } else {
        //if the user is the owner
        bookings = await Booking.findAll({
            where: { spotId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        })
    }

    return res.json({ Booking: bookings });
})

//create a new booking for a spot
router.post('/spots/:spotId/bookings', requireAuth, async (req,res) => {
    const { spotId } = req.params;
    const { userId } = req.user;
    const { startDate, endDate } = req.body;

    const spot = await Spot.findByPk(spotId);

    if(!spot) {
        return res.status(404).json({ message: "Spot couldn't not be found"})
    }
    if(spot.ownerId === userId){
        return res.status(403).json({ message: "Unauthorized" })
    }

    //check booking conflicts
    const existingBooking = await Booking.findAll({
        where: {
            spotId,
            [Op.or]: [
                { startDate: { [Op.between]: [startDate, endDate] } },
                { endDate: { [Op.between]: [startDate, endDate] } },
            ],
        },
    });

    if(existingBooking.length > 0) {
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            error: {
                startDate: "Start date conflicts with an existing booking",
                endDate: "End date conflicts with an existing booking"
            }
        })
    }

    const newBooking = await Booking.create({
        userId,
        spotId,
        startDate,
        endDate,
    });

    return res.json({
        id: newBooking.id,
        spotId,
        userId,
        startDate,
        endDate,
        createdAt: newBooking.createdAt,
        updatedAt: newBooking.updatedAt
    });
})

//edit a booking
router.put('/bookings/:bookingId', requireAuth, async (req,res) => {
    const { bookingId } = req.params;
    const { userId, startDate, endDate } = req.body;

    const booking = await Booking.findByPk(bookingId);

    if(!booking || booking.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    //check dates
    const valiDate = validDates(startDate, endDate);
    if(valiDate !== null){
        return res.status(400).json({ message: "Bad request", errors: valiDate })
    }

    //no booking for time travelers
    const currentDate = new Date();
    if(booking.endDate < currentDate.toISOString().split('T')[0]){
        return res.status(403).json({ message: "Past bookings can't be modified" })
    }

    //check booking conflicts
    const existingBooking = await Booking.findAll({
        where: {
            spotId: booking.spotId,
            [Op.not]: { id: booking.id },
            [Op.or]: [
                { startDate: { [Op.between]: [startDate, endDate] } },
                { endDate: { [Op.between]: [startDate, endDate] } },
            ],
        },
    });
    if(existingBooking.length > 0){
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            errors: {
                startDate: "Start date conflicts with an existing booking",
                endDate: "End date conflicts with an existing booking"
            }
        })
    }

    //update time
    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    return res.json({
        id: booking.id,
        spotId: booking.spotId,
        userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
    });
});

//delete a booking
router.delete('/bookings/:bookingId', requireAuth, async (req,res) => {
    const { bookingId } = req.params;
    const { userId } = req.body;

    const booking = await Booking.findByPk(bookingId);

    if(!booking || booking.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    //no booking for time travelers
    const currentDate = new Date();
    if(booking.endDate < currentDate.toISOString().split('T')[0]){
        return res.status(403).json({ message: "Past bookings can't be modified" })
    }

    //delete the booking
    await booking.destroy();

    return res.json({ message: 'Booking deleted' });
})



module.exports = router;
