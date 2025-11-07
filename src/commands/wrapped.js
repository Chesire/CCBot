const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isWrappedSeason } = require('../utils/wrapped-season-validator');
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

  await interaction.deferReply();

  try {
    const topMessages = await wrappedDb.Wrapped.findAll({
      order: [['messagecount', 'DESC']],
      limit:10,
      raw: true
    });
    const topMissed = await wrappedDb.Wrapped.findAll({
      order: [['missedchallenges', 'DESC']],
      limit: 10,
      raw: true
    });
    const topShamed = await wrappedDb.Wrapped.findAll({
      order: [['shamedcount', 'DESC']],
      limit: 10,
      raw: true
    });
    const topLost = await wrappedDb.Wrapped.findAll({
      order: [['timeslost', 'DESC']],
      limit: 10,
      raw: true
    });

    const guild = interaction.guild;
    const userMap = {};

    const allUsers = new Set();
    [topMessages, topMissed, topShamed, topLost].forEach(list => {
      list.forEach(u => allUsers.add(String(u.userid)));
    });

    for (const userId of allUsers) {
      try {
        console.log(`[Wrapped] Attempting to fetch member from guild ${userId}...`);
        const member = await guild.members.fetch(userId);
        console.log(`[Wrapped] Successfully fetched member: ${member.displayName}`);
        userMap[userId] = member.displayName;
      } catch (error) {
        console.log(`[Wrapped] Failed to fetch from guild: ${error.message}`);
        try {
          const user = await interaction.client.users.fetch(userId);
          console.log(`[Wrapped] Successfully fetched user: ${user.username}`);
          userMap[userId] = user.username;
        } catch (error2) {
          console.log(`[Wrapped] Failed to fetch user: ${error2.message}`);
          userMap[userId] = `User ${userId}`;
        }
      }
    }

    const formatLeaderboard = (users, statKey) => {
      console.log(`[Wrapped] formatLeaderboard called with ${users.length} users for stat: ${statKey}`);
      if (!users || users.length === 0) {
        return 'No data';
      }

      const lines = [];
      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        if (u[statKey] == 0) {
            // Data is DESC so should have reached end of this one
            break;
        }
        const userId = String(u.userid);
        const displayName = userMap[userId];
        lines.push(`${i + 1}. **${displayName}** - ${u[statKey]}`);
      }
      console.log(`[Wrapped] Leaderboard complete with ${lines.length} entries`);
      return lines.join('\n');
    };

    const messagesEmbed = new EmbedBuilder()
      .setTitle('Most Messages')
      .setColor(0x4ECDC4)
      .setDescription(formatLeaderboard(topMessages, 'messagecount'));
    const failedEmbed = new EmbedBuilder()
      .setTitle('Most Challenges Failed')
      .setColor(0xFFE66D)
      .setDescription(formatLeaderboard(topMissed, 'missedchallenges'));
    const shamedEmbed = new EmbedBuilder()
      .setTitle('Most Shamed')
      .setColor(0xFF6B6B)
      .setDescription(formatLeaderboard(topShamed, 'shamedcount'));
    const lostEmbed = new EmbedBuilder()
      .setTitle('Most Times Lost')
      .setColor(0xA8DADC)
      .setDescription(formatLeaderboard(topLost, 'timeslost'));

    await interaction.editReply({ embeds: [messagesEmbed, failedEmbed, shamedEmbed, lostEmbed]});
  } catch (error) {
    console.error('Error fetching data for wrapped: ', error);
    await interaction.editReply('Error fetching wrapped data. Please try again later.');
  }
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'show') {
      await show(interaction);
    } else {
      await interaction.reply('Unknown command');
    }
  }
};
