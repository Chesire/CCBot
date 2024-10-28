const { Events } = require('discord.js');
const cron = require('cron');
const token = require('../config.json');

async function fireDailyCron(client) {
	const guildId = token.guildId;
	const channelId = token.cronChannelId;

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);
}

async function fireWeeklyCron(client) {
	const guildId = token.guildId;
	const channelId = token.cronChannelId;

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);
}

async function fireMonthlyCron(client) {
	const guildId = token.guildId;
	const channelId = token.cronChannelId;

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`${client.user.tag} ready. Starting cron jobs!`);
		const dailyMessage = new cron.CronJob('00 00 07 * * *', () => {
			// This runs every day at 7:00:00
			fireDailyCron(client);
		});
		const weeklyMessage = new cron.CronJob('00 00 07 * * mon', () => {
			// This runs every week on Monday at 7:00:00
			fireWeeklyCron(client);
		});
		const monthlyMessage = new cron.CronJob('00 00 07 01 * *', () => {
			// This runs the first of the month at 7:00:00
			fireMonthlyCron(client);
		});

        // When you want to start it, use:
        dailyMessage.start();
		weeklyMessage.start();
		monthlyMessage.start();
		console.log('Cron jobs started');
	}
};
