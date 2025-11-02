const { SlashCommandBuilder } = require('discord.js');
const { isWrappedSeason } = require('../utils/wrappedSeasonValidator');
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
  if (!isWrappedSeason()) {
    return await interaction.reply('Its not yet time for wrapped');
  }

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
