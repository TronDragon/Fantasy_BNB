'use strict';

const { ReviewImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: 'https://example_image',
      }
    ]),
    { validate: true }
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    return ReviewImage.destroy({
      where: {},
    });
  }
};
