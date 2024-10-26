const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const challenges = sequelize.define('challenges', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	timeframe: Sequelize.TEXT,
	username: Sequelize.STRING,
	cheats: {
		type: Sequelize.NUMBER,
		defaultValue: 0
	} ,
	allowpause: {
		type: Sequelize.TEXT,
		defaultValue: false
	} 
});

module.exports = { challenges }
