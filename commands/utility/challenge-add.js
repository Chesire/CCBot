const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
		.setName('challenge-add')
		.setDescription('Adds a new challenge for a user')
	    .addStringOption(option =>
		    option.setName('input')
			    .setDescription('The input to echo back'));

module.exports = { 
	cooldown: 5,
	data: data,   
	async execute(interaction) {
		await interaction.reply({ content: 'Some challenges' });
	}, 
}; 
