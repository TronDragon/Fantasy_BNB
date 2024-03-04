'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

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
      },
      {
        ownerId: 2,
        address: 'The Prancing Pony',
        city: 'Bree',
        state: 'Eriador',
        country: 'Middle-earth',
        name: 'The Prancing Pony',
        description: 'A popular tavern in Bree',
        latitude: 42.59,
        longitude: -73.21,
        price: 40,
      },
      {
        ownerId: 3,
        address: 'Gadgetzan',
        city: 'Tanaris',
        state: 'Kalimdor',
        country: 'Azeroth',
        name: 'Salty Sailor Tavern',
        description: 'A desert oasis tavern',
        latitude: -24.76,
        longitude: -66.69,
        price: 60,
      },
      {
        ownerId: 4,
        address: 'Rivendell',
        city: 'Eregion',
        state: 'Eriador',
        country: 'Middle-earth',
        name: 'The Last Homely House',
        description: 'A refuge for elves',
        latitude: 43.22,
        longitude: -90.34,
        price: 80,
      },
      {
        ownerId: 5,
        address: 'Ten Towns',
        city: 'Icewind Dale',
        state: 'Sword Coast',
        country: 'Forgotten Realms',
        name: 'Frosty Retreat',
        description: 'A spot near the chilling Ten Towns',
        latitude: 32.93,
        longitude: -84.77,
        price: 65,
      },
      {
        ownerId: 6,
        address: "Ul'dah",
        city: 'Thanalan',
        state: 'Eorzea',
        country: 'Hydaelyn',
        name: 'The Ruby Bazaar',
        description: 'A bustling marketplace in Ul\'dah',
        latitude: -23.55,
        longitude: -46.63,
        price: 75,
      },
    ]),
    { validate: true }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return Spot.destroy({
      where: {},
    });
  }
};
