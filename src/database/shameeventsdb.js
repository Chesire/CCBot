const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize('shameeventsdb', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: path.join(__dirname, '../../data/shameeventsdb.sqlite'),
});

const ShameEvents = sequelize.define('shameevents', {
  userid: Sequelize.TEXT,
  eventid: Sequelize.TEXT
});

module.exports = { ShameEvents };
