const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('challengedb', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'challengedb.sqlite',
});

const Challenges = sequelize.define('challenges', {
	name: Sequelize.TEXT,
	description: Sequelize.TEXT,
	timeframe: Sequelize.TEXT,
	username: Sequelize.TEXT,
	userid: Sequelize.TEXT,
	cheats: {
		type: Sequelize.NUMBER,
		defaultValue: 0
	},
	allowpause: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	}
});

module.exports = { Challenges };
