const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('shameeventsdb', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'shameeventsdb.sqlite',
});

const ShameEvents = sequelize.define('shameevents', {
    userid: Sequelize.TEXT,
    eventid: Sequelize.TEXT
});

module.exports = { ShameEvents };
