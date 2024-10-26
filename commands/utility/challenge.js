const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Interact with challenges")
    .addSubcommand(subCommand =>
        subCommand
            .setName("add")
            .setDescription("Adds a challenge for a user")
	    	.addStringOption(option =>
			    option.setName('description')
					.setDescription('Description of the challenge being done')
					.setMaxLength(200)
					.setRequired(true))
			.addStringOption(option =>
				option
					.setName('time-frame')
					.setDescription('What is the time frame the challenge occurs in?')
					.setRequired(true)
					.addChoices(
						{ name: 'Daily', value: 'daily' },
						{ name: 'Weekly', value: 'weekly' },
						{ name: 'Monthly', value: 'monthly' }
				))
			.addNumberOption(option =>
				option
					.setName('cheats')
					.setDescription('How many cheat days are allowed in each time window?')
					.setMinValue(0)
					.setMaxValue(4))
			.addBooleanOption(option =>
				option
					.setName('allow-pause')
					.setDescription("Are pauses allowed for special occasions?")))
	.addSubcommand(subCommand =>
        subCommand
            .setName("list-all")
			.setDescription("Lists all users challenges"))
	.addSubcommand(subCommand =>
        subCommand
            .setName("list-user")
			.setDescription("Lists users challenges")
            .addUserOption(option =>
                option
                    .setName('target')
                    .setDescription('The user')
                    .setRequired(true)))
	.addSubcommand(subCommand =>
		subCommand
			.setName('remove')
			.setDescription('Removes a challenge from a user'))
	.addSubcommand(subCommand =>
		subCommand
			.setName('cheat')
			.setDescription('Sets that today is a cheat day'))
	.addSubcommand(subCommand =>
		subCommand
			.setName('pause')
			.setDescription('Sets a date for a pause day')
			.addStringOption(option => 
				option
					.setName("reason")
					.setDescription("Why the pause")
					.setRequired(true)))
	
async function addChallenge(interaction) {
	const description = interaction.options.getString('description')
	const timeFrame = interaction.options.getString('time-frame')
	const cheats = interaction.options.getNumber('cheats')
	const allowPause = interaction.options.getBoolean('allow-pause')
	await interaction.reply(`${interaction.user.displayName} is adding a challenge.\nThey will do "${description}" every ${timeFrame}`);
}

async function listAllChallenges(interaction) {
	await interaction.reply(`In list all challenge`);
}

async function listMyChallenges(interaction) {
	await interaction.reply(`In list my challenge`);
}

async function removeChallenge(interaction) {
	await interaction.reply(`In remove challenge`);
}

module.exports = { 
	cooldown: 5,
	data: data,
    async execute(interaction) {
        if (interaction.options.getSubcommand() === "add") {
            addChallenge(interaction)
        } else if (interaction.options.getSubcommand() === "list-all") {
            listAllChallenges(interaction)
        } else if (interaction.options.getSubcommand() === "list-user") {
            listMyChallenges(interaction)
        } else if (interaction.options.getSubcommand() === "remove") {
            removeChallenge(interaction)
		} else {
			await interaction.reply('NYI')
		}
	}
}; 
