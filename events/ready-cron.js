const { Events } = require('discord.js');
const cron = require('cron');
const token = require('../config.json');
const challengedb = require('../db/challengedb');

async function fireDailyCron(client) {
	console.log('Starting day cron');
	const guildId = token.guildId;
	const channelId = token.challengeChannelId;

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);

	const challenges = await challengedb.Challenges.findAll({ where: { timeframe: 'daily' } });
	console.log(`Found ${challenges.length} challenges`);
	if (challenges.length > 0) {
		const challengesString = challenges.map(c =>
			`<@${c.userid}>, did you complete your ${c.name} challenge yesterday?`
		).join('\n');

		await channel.send(`${challengesString}`);
	}
}

async function fireWeeklyCron(client) {
	console.log('Starting week cron');
	const guildId = token.guildId;
	const channelId = token.challengeChannelId;

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);

	const challenges = await challengedb.Challenges.findAll({ where: { timeframe: 'weekly' } });
	console.log(`Found ${challenges.length} challenges`);
	if (challenges.length > 0) {
		const challengesString = challenges.map(c =>
			`<@${c.userid}>, did you complete your ${c.name} challenge last week?`
		).join('\n');

		await channel.send(`${challengesString}`);
	}
}

async function fireMonthlyCron(client) {
	console.log('Starting month cron');
	const guildId = token.guildId;
	const channelId = token.challengeChannelId;

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);

	const challenges = await challengedb.Challenges.findAll({ where: { timeframe: 'monthly' } });
	console.log(`Found ${challenges.length} challenges`);
	if (challenges.length > 0) {
		const challengesString = challenges.map(c =>
			`<@${c.userid}>, did you complete your ${c.name} challenge last month?`
		).join('\n');

		await channel.send(`${challengesString}`);
	}
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

        dailyMessage.start();
		weeklyMessage.start();
		monthlyMessage.start();
		console.log('Cron jobs started');
	}
};
