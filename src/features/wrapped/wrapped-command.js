const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  isWrappedSeason,
} = require("../../core/utils/wrapped-season-validator");
const UserFetcher = require("../../core/utils/user-fetcher");

const data = new SlashCommandBuilder()
  .setName("wrapped")
  .setDescription("Show the yearly wrapped");

async function show(interaction) {
  // TODO: Fix this to use the new DB correctly
  if (!isWrappedSeason()) {
    return await interaction.reply("Its not yet time for wrapped");
  } else {
    return await interaction.reply("Its not yet time for wrapped");
  }

  /*
  await interaction.deferReply();

  try {
    const topMessages = await wrappedDb.Wrapped.findAll({
      order: [["messagecount", "DESC"]],
      limit: 10,
      raw: true,
    });
    const topMissed = await wrappedDb.Wrapped.findAll({
      order: [["missedchallenges", "DESC"]],
      limit: 10,
      raw: true,
    });
    const topShamed = await wrappedDb.Wrapped.findAll({
      order: [["shamedcount", "DESC"]],
      limit: 10,
      raw: true,
    });
    const topLost = await wrappedDb.Wrapped.findAll({
      order: [["timeslost", "DESC"]],
      limit: 10,
      raw: true,
    });

    const allUsers = new Set();
    [topMessages, topMissed, topShamed, topLost].forEach((list) => {
      list.forEach((u) => allUsers.add(String(u.userid)));
    });

    const userMap = await UserFetcher.fetchUsersByIds(
      Array.from(allUsers),
      interaction.guild,
      interaction.client,
    );

    const formatLeaderboard = (users, statKey) => {
      console.log(
        `[Wrapped] formatLeaderboard called with ${users.length} users for stat: ${statKey}`,
      );
      if (!users || users.length === 0) {
        return "No data";
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
      console.log(
        `[Wrapped] Leaderboard complete with ${lines.length} entries`,
      );
      return lines.join("\n");
    };

    const messagesEmbed = new EmbedBuilder()
      .setTitle("Most Messages")
      .setColor(0x4ecdc4)
      .setDescription(formatLeaderboard(topMessages, "messagecount"));
    const failedEmbed = new EmbedBuilder()
      .setTitle("Most Challenges Failed")
      .setColor(0xffe66d)
      .setDescription(formatLeaderboard(topMissed, "missedchallenges"));
    const shamedEmbed = new EmbedBuilder()
      .setTitle("Most Shamed")
      .setColor(0xff6b6b)
      .setDescription(formatLeaderboard(topShamed, "shamedcount"));
    const lostEmbed = new EmbedBuilder()
      .setTitle("Most Times Lost")
      .setColor(0xa8dadc)
      .setDescription(formatLeaderboard(topLost, "timeslost"));

    await interaction.editReply({
      embeds: [messagesEmbed, failedEmbed, shamedEmbed, lostEmbed],
    });
  } catch (error) {
    console.error("Error fetching data for wrapped: ", error);
    await interaction.editReply(
      "Error fetching wrapped data. Please try again later.",
    );
  }
  */
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    console.log(
      `[Wrapped][caller:${interaction.user.displayName}] Used wrapped`,
    );
    await show(interaction);
  },
};
