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
    const confirmation = interaction.options.getString('verify');
    if (confirmation !== 'RESET') {
        console.log(`Reset was called, but verify text was ${confirmation}`);
        await interaction.reply('Incorrect verify text, ignoring call to reset');
        return;
    }
    console.log('Reset was called, and verify text was correct');

    await interaction.reply('Reset successful, wrapped data is cleared');
    await wrappedDb.Wrapped.destroy({
        truncate: true
    });
}

async function show(interaction) {
    await interaction.reply('Nice try, its not end of year yet.');
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
