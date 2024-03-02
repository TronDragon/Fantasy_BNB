'use strict';

const { Booking } = require('../models');

module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        startDate: '5-24-2024',
        endDate: '5-26-2024',
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Bookings', null, {});
  }
};
