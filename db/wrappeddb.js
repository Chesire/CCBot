const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('wrappeddb', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'wrappeddb.sqlite',
});

const Wrapped = sequelize.define('wrapped', {
    userid: Sequelize.TEXT,
    messageCount: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    },
    shamedCount: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    },
    missedChallenges: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    },
    timesLost: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    }
});

module.exports = { Wrapped };
