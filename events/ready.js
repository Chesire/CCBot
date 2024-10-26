const { Events } = require('discord.js');
const challengedb = require('../db/challengedb')

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		challengedb.Challenges.sync()
		console.log(`Ready! Logged in as ${client.user.tag}`);
	}
};
