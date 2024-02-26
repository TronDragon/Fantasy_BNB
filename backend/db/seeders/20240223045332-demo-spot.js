'use strict';

const { Spot } = require('../models');

module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: 'Goldshire',
        city: 'Elwynn Forest',
        state: 'Azeroth',
        country: 'Eastern Kingdoms',
        name: 'Goldshire Inn',
        description: 'A cozy inn',
        latitude: 35.87,
        longitude: -78.75,
        price: 50,
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Spots', null, {});
  }
};
