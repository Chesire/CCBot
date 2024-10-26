const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Interact with challenges")
    .addSubcommand(subCommand =>
        subCommand
            .setName("add")
            .setDescription("Adds a challenge for a user")
	    	.addStringOption(option =>
			    option.setName('input')
					.setDescription('The input to echo back')
					.setMaxLength(100)
					.setRequired(true)
			)
	)
	.addSubcommand(subCommand =>
        subCommand
            .setName("list-all")
			.setDescription("Lists all users challenges")
	)
	.addSubcommand(subCommand =>
        subCommand
            .setName("list-user")
			.setDescription("Lists users challenges")
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
	
async function addChallenge(interaction) {
	await interaction.reply(`In add challenge`);
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
        }
	},
}; 
