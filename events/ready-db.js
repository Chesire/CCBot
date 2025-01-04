const { Events } = require('discord.js');
const admindb = require('../db/admindb');
const challengedb = require('../db/challengedb');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`${client.user.tag} ready. Syncing DBs!`);
		admindb.Admin.sync({ alter: true });
		challengedb.Challenges.sync();
		console.log('DBs Synced!');
	}
};
