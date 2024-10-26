const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('challenge-list')
		.setDescription('Lists out all challenges for a user'), 
	async execute(interaction) {
		await interaction.reply({ content: 'Some challenges' }); 
	}, 
}; 
 