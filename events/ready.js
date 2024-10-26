const { Events } = require('discord.js');
const challengedb = require('../db/challengedb')

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		challengedb.challenges.sync()
		console.log(`Ready! Logged in as ${client.user.tag}`);
	}
};
