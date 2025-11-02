const { SlashCommandBuilder } = require('discord.js');
const wrappedDb = require('../database/wrappeddb');

const data = new SlashCommandBuilder()
  .setName('wrapped')
  .setDescription('Commands to interact with the yearly wrapped')
  .addSubcommand(subCommand =>
    subCommand
      .setName('show')
      .setDescription('Prints out the wrapped info for everybody')
  );

async function show(interaction) {
  await interaction.reply('Nice try, its not end of year yet.');
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'show') {
      show(interaction);
    } else {
      await interaction.reply('Unknown command');
    }
  }
};
