'use strict';
const { Review } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Reviews'
    return Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        content: 'A time was had',
        rating: 3,
      }
    ]),
    { validate: true }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;

    return Review.destroy({ where: []});
  }
};
