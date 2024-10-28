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
    )
    .addSubcommand(subCommand =>
        subCommand
            .setName('server')
            .setDescription('Get information about the server')
    );

async function handleUserSubcommand(interaction) {
    const user = interaction.options.getUser('target');
    await interaction.reply(`${interaction.user.displayName} searched up user\nUsername: ${user.displayName}\nID: ${user.id}`);
}

async function handleServerSubCommand(interaction) {
    await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
}

module.exports = {
	cooldown: 5,
	data: data,
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'user') {
            handleUserSubcommand(interaction);
        } else if (interaction.options.getSubcommand() === 'server') {
            handleServerSubCommand(interaction);
        }
	},
};
