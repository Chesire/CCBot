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
    const topShamed = await wrappedDb.Wrapped.findAll({
      order: [['shamedcount', 'DESC']],
      limit: 5,
      raw: true
    });
    console.log('topShamed:', topShamed);

    const topMessages = await wrappedDb.Wrapped.findAll({
      order: [['messagecount', 'DESC']],
      limit: 5,
      raw: true
    });

    const topMissed = await wrappedDb.Wrapped.findAll({
      order: [['missedchallenges', 'DESC']],
      limit: 5,
      raw: true
    });

    const topLost = await wrappedDb.Wrapped.findAll({
      order: [['timeslost', 'DESC']],
      limit: 5,
      raw: true
    });

    const guild = interaction.guild;
    const formatLeaderboard = async (users, statKey) => {
      console.log(`[Wrapped] formatLeaderboard called with ${users.length} users for stat: ${statKey}`);
      if (!users || users.length === 0) {
        return 'No data';
      }

      const lines = [];
      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        const userId = String(u.userid);
        console.log(`[Wrapped] Processing user ${i + 1}: ${userId}`);
        
        try {
          console.log(`[Wrapped] Attempting to fetch member from guild ${userId}...`);
          const member = await guild.members.fetch(userId);
          console.log(`[Wrapped] Successfully fetched member: ${member.displayName}`);
          lines.push(`${i + 1}. **${member.displayName}** - ${u[statKey]}`);
        } catch (error) {
          console.log(`[Wrapped] Failed to fetch from guild: ${error.message}`);
          console.log(`[Wrapped] Attempting to fetch user from client ${userId}...`);
          try {
            const user = await interaction.client.users.fetch(userId);
            console.log(`[Wrapped] Successfully fetched user: ${user.username}`);
            lines.push(`${i + 1}. **${user.username}** - ${u[statKey]}`);
          } catch (error2) {
            console.log(`[Wrapped] Failed to fetch user: ${error2.message}`);
            console.log(`[Wrapped] Using ID fallback`);
            lines.push(`${i + 1}. **User ${userId}** - ${u[statKey]}`);
          }
        }
      }
      console.log(`[Wrapped] Leaderboard complete with ${lines.length} entries`);
      return lines.join('\n');
    };

    const messagesEmbed = new EmbedBuilder()
      .setTitle('Most Messages')
      .setColor(0x4ECDC4)
      .setDescription(await formatLeaderboard(topMessages, 'messagecount'));
    //const failedEmbed = new EmbedBuilder()
    //  .setTitle('Most Challenges Failed')
    //  .setColor(0xFFE66D)
    //  .setDescription(await formatLeaderboard(topMissed, 'missedchallenges'));
    //const shamedEmbed = new EmbedBuilder()
    //  .setTitle('Most Shamed')
    //  .setColor(0xFF6B6B)
    //  .setDescription(await formatLeaderboard(topShamed, 'shamedcount'));
    //const lostEmbed = new EmbedBuilder()
    //  .setTitle('Most Times Lost')
    //  .setColor(0xA8DADC)
    //  .setDescription(await formatLeaderboard(topLost, 'timeslost'));

    await interaction.editReply({ embeds: [messagesEmbed]});
    // await interaction.reply({ embeds: [messagesEmbed, failedEmbed, shamedEmbed, lostEmbed]});
  } catch (error) {
    console.error('Error fetching data for wrapped: ', error);
    await interaction.reply('Error fetching wrapped data. Please try again later.');
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
