const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('wrappeddb', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'wrappeddb.sqlite',
});

const Wrapped = sequelize.define('wrapped', {
    userid: Sequelize.NUMBER,
    messagecount: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    },
    shamedcount: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    },
    missedchallenges: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    },
    timeslost: {
        type: Sequelize.NUMBER,
        defaultValue: 0
    }
});

module.exports = { Wrapped };
