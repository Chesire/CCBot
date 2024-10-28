const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('secret-ping')
		.setDescription('Secretly replies with Pong!'),
	async execute(interaction) {
		await interaction.reply({ content: 'Secret Pong!', ephemeral: true });
	}
};
