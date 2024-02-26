'use strict';

const { SpotImage } = require('../models');

module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate([
      {
        spotId: 1,
        url: 'https://example_image',
        preview: true,
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('SpotImages', null, {});
  }
};
