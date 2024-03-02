'use strict';
const { Review } = require('../models')

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        content: 'A time was had',
        rating: 3,
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Review', null, {});
  }
};
