const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('challenge-remove')
		.setDescription('Removes a challenge for a user'), 
	async execute(interaction) {
		await interaction.reply({ content: 'Some challenges' }); 
	}, 
}; 
 