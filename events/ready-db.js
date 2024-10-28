const { Events } = require('discord.js');
const challengedb = require('../db/challengedb');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`${client.user.tag} ready. Syncing DB!`);
		challengedb.Challenges.sync();
		console.log('DB Synced!');
	}
};
