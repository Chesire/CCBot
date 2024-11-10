const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about a user or server')
    .addSubcommand(subCommand =>
        subCommand
            .setName('user')
            .setDescription('Get information about a user')
            .addUserOption(option =>
                option
                    .setName('target')
                    .setDescription('The user')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('testing')
                    .setDescription('testing2')
                    .setRequired(true)
            )
    );

async function handleUserSubcommand(interaction) {
    const user = interaction.options.getUser('target');
    await interaction.reply(`${interaction.user.displayName} searched up user\nUsername: ${user.displayName}\nID: ${user.id}`);
}

module.exports = {
	cooldown: 5,
	data: data,
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'user') {
            handleUserSubcommand(interaction);
        }
	},
};
