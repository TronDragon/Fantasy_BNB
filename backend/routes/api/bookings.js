const express = require('express');
const router = express.Router();
const { Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');

//get all bookings for a user by ID
router.get('/:userId', requireAuth, async (req,res) => {
    const { userId } = req.params;

    const bookings = await Booking.findAll({
        where: { userId },
    });
    return res.json({ bookings });
});

//create a new booking for a spot
router.post('/create', requireAuth, async (req,res) => {
    const { userId, spotId, startDate, endDate } = req.body;

    const newBooking = await Booking.create({
        userId,
        spotId,
        startDate,
        endDate,
    });

    return res.json({ booking: newBooking });
})

//get a booking by ID
router.get('/:bookingId', requireAuth, async (req,res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId);

    if(!booking){
        return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({ booking });
})

//edit a booking
router.put('/:bookingId/edit', requireAuth, async (req,res) => {
    const { bookingId } = req.params;
    const { userId, startDate, endDate } = req.body;

    const booking = await Booking.findByPk(bookingId);

    if(!booking || booking.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    //update time
    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    return res.json({ booking });
});

//delete a booking
router.delete('/:bookingId/delete', requireAuth, async (req,res) => {
    const { bookingId } = req.params;
    const { userId } = req.body;

    const booking = await Booking.findByPk(bookingId);

    if(!booking || booking.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    //delete the booking
    await booking.destroy();

    return res.json({ message: 'Booking deleted' });
})



module.exports = router;
