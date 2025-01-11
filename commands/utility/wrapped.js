const { SlashCommandBuilder } = require('discord.js');
const wrappedDb = require('../../db/wrappeddb');

const data = new SlashCommandBuilder()
    .setName('wrapped')
    .setDescription('Commands to interact with the yearly wrapped')
    .addSubcommand(subCommand =>
        subCommand
            .setName('reset')
            .setDescription('Resets all wrapped data')
            .addStringOption(option =>
                option
                    .setName('verify')
                    .setDescription('To verify you are happy to reset, enter RESET')
            )
    )
    .addSubcommand(subCommand =>
        subCommand
            .setName('show')
            .setDescription('Prints out the wrapped info for everybody')
    );

async function reset(interaction) {

}

async function show(interaction) {

}

module.exports = {
	cooldown: 5,
	data: data,
    async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'reset') {
            reset(interaction);
        } else if (subCommand === 'show') {
            show(interaction);
        } else {
			await interaction.reply('Unknown command');
		}
	}
};