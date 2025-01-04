const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const challengedb = require('../../db/challengedb');

const challengeLimit = 5;

const data = new SlashCommandBuilder()
    .setName('challenge')
    .setDescription('Interact with challenges')
    .addSubcommand(subCommand =>
        subCommand
            .setName('add')
            .setDescription('Adds a challenge for a user')
			.addStringOption(option =>
				option
					.setName('name')
					.setDescription('Give the challenge a short name')
					.setMaxLength(20)
					.setRequired(true)
			)
	    	.addStringOption(option =>
				option
					.setName('description')
					.setDescription('Description of the challenge being done')
					.setMaxLength(200)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('time-frame')
					.setDescription('What is the time frame the challenge occurs in?')
					.setRequired(true)
					.addChoices(
						{ name: 'Daily', value: 'daily' },
						{ name: 'Weekly', value: 'weekly' },
						{ name: 'Monthly', value: 'monthly' }
					)
			)
			.addNumberOption(option =>
				option
					.setName('cheats')
					.setDescription('How many cheat days are allowed in each time frame?')
					.setMinValue(0)
					.setMaxValue(4)
					.setRequired(true)
			)
			.addBooleanOption(option =>
				option
					.setName('allow-pause')
					.setDescription('Are pauses allowed for special occasions?')
					.setRequired(true)
			)
	)
	.addSubcommand(subCommand =>
        subCommand
            .setName('list-all')
			.setDescription('Lists all users challenges')
	)
	.addSubcommand(subCommand =>
        subCommand
            .setName('list-user')
			.setDescription('Lists users challenges')
            .addUserOption(option =>
                option
                    .setName('target')
                    .setDescription('The user')
                    .setRequired(true)
			)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName('remove')
			.setDescription('Removes a challenge from a user')
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName('cheat')
			.setDescription('Sets that today is a cheat day')
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName('pause')
			.setDescription('Sets a date for a pause day')
			.addStringOption(option =>
				option
					.setName('reason')
					.setDescription('Why the pause')
					.setRequired(true)
			)
	);

async function addChallenge(interaction) {
	const name = interaction.options.getString('name');
	const description = interaction.options.getString('description');
	const timeFrame = interaction.options.getString('time-frame');
	const cheats = interaction.options.getNumber('cheats');
	const allowPause = interaction.options.getBoolean('allow-pause');

	try {
		const usersChallenges = await challengedb.Challenges.findAll({ where: { userid: interaction.user.id } });
		if (usersChallenges.length >= challengeLimit) {
			await interaction.reply('Too many challenges active, delete one to add another.');
		} else {
			await challengedb.Challenges.create({
				name: name,
				description: description,
				timeframe: timeFrame,
				username: interaction.user.displayName,
				userid: interaction.user.id.toString(),
				cheats: cheats,
				allowpause: allowPause
			});
			let timeString = 'day';
			if (timeFrame === 'daily') {
				timeString = 'day';
			} else if (timeFrame === 'weekly') {
				timeString = 'week';
			} else if (timeFrame === 'monthly') {
				timeString = 'month';
			}
			await interaction.reply(`<@${interaction.user.id}> is adding their '${name}' challenge.\nEvery ${timeString} they will do '${description}'\nThey will ${allowPause ? '' : 'not ' }allow pauses\nThey are allowing ${cheats} cheats per ${timeString}.`);
		}
	} catch (error) {
		console.log(`<@${interaction.user.id}> tried to add a challenge, but an error occurred. ${error}`);
		await interaction.reply('Failed to add a challenge, try again');
	}
}

async function listAllChallenges(interaction) {
	const challenges = await challengedb.Challenges.findAll();
	if (challenges.length > 0) {
		const challengesString = challenges.map(c => `<@${c.userid}> - ${c.name} - ${c.description}`).join('\n');

		await interaction.reply(`All current challenges are:\n${challengesString}`);
	} else {
		await interaction.reply('Could not find any challenges');
	}
}

async function listUserChallenges(interaction) {
	const target = interaction.options.getUser('target');
	const challenges = await challengedb.Challenges.findAll({ where: { userid: target.id } });
	if (challenges.length > 0) {
		const buttons = challenges.map(c =>
			new ButtonBuilder()
				.setCustomId(c.id.toString())
				.setLabel(c.name)
				.setStyle(ButtonStyle.Secondary)
		);

		const row = new ActionRowBuilder()
			.addComponents(buttons);

		const response = await interaction.reply({
			content: `Current challenges for ${target}`,
			components: [row]
		});
		const collectorFilter = i => i.user.id === interaction.user.id;

		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
			const challenge = await challengedb.Challenges.findOne({ where: { id: parseInt(confirmation.customId) } });
			if (challenge) {
				await confirmation.update({
					content: `${challenge.id}: ${challenge.name} - ${challenge.description}`,
					components: []
				});
			}
		} catch {
			await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
	} else {
		await interaction.reply('Could not find any challenges for that user');
	}
}

async function removeChallenge(interaction) {
	const targetUser = interaction.user;
	const challenges = await challengedb.Challenges.findAll({ where: { userid: targetUser.id } });
	if (challenges.length > 0) {
		const buttons = challenges.map(c =>
			new ButtonBuilder()
				.setCustomId(c.id.toString())
				.setLabel(c.name)
				.setStyle(ButtonStyle.Secondary)
		);

		const row = new ActionRowBuilder()
			.addComponents(buttons);

		const response = await interaction.reply({
			content: `Current challenges for ${targetUser}`,
			components: [row]
		});
		const collectorFilter = i => i.user.id === interaction.user.id;

		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
			const challenge = await challengedb.Challenges.findOne({ where: { id: parseInt(confirmation.customId) } });
			if (challenge) {
				await challengedb.Challenges.destroy({ where: { id: parseInt(confirmation.customId) } });
				await confirmation.update({
					content: `Challenge '${challenge.name}' successfully deleted`,
					components: []
				});
			}
		} catch {
			await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
	} else {
		await interaction.reply('Could not find any challenges for that user');
	}
}

async function cheatDay(interaction) {
	const targetUser = interaction.user;
	await interaction.reply(`${targetUser} is taking today as a cheat day.`);
}

module.exports = {
	cooldown: 5,
	data: data,
    async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'add') {
            addChallenge(interaction);
        } else if (subCommand === 'list-all') {
            listAllChallenges(interaction);
        } else if (subCommand === 'list-user') {
            listUserChallenges(interaction);
        } else if (subCommand === 'remove') {
            removeChallenge(interaction);
		} else if (subCommand === 'cheat') {
			cheatDay(interaction);
		} else {
			await interaction.reply('NYI');
		}
	}
};
