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


module.exports = router;
