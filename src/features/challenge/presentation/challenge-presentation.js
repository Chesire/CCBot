const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const challengePresentation = {
  buildAddChallengeEmbed(user, challenge) {
    const timeFrameString =
      challenge.timeframe.charAt(0).toUpperCase() +
      challenge.timeframe.slice(1);
    return new EmbedBuilder()
      .setTitle("New Challenge")
      .setColor(0xc100ff)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(
        `**${user.displayName}** has added their '${challenge.name}' challenge!`,
      )
      .addFields(
        { name: "Description", value: challenge.description, inline: false },
        { name: "Time Frame", value: timeFrameString, inline: true },
        {
          name: "Cheats Allowed",
          value: challenge.cheats.toString(),
          inline: true,
        },
        {
          name: "Pauses Allowed",
          value: challenge.allowpause ? "Yes" : "No",
          inline: true,
        },
      );
  },

  buildEmptyListChallengeEmbed(user) {
    return new EmbedBuilder()
      .setTitle("User Challenges")
      .setColor(0xc100ff)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(`**${user.displayName}** has no active challenges.`);
  },

  buildListChallengesEmbed(user, challenges) {
    const fields = challenges.map((c) => ({
      name: c.name,
      value: `**Description:** ${c.description}\n**Timeframe:** ${c.timeframe.charAt(0).toUpperCase() + c.timeframe.slice(1)}\n**Cheats Allowed:** ${c.cheats}\n**Pauses Allowed:** ${c.allowpause ? "Yes" : "No"}`,
      inline: false,
    }));

    // Split fields into chunks of 25 (Discord's field limit per embed)
    const chunkSize = 25;
    const embeds = [];
    for (let i = 0; i < fields.length; i += chunkSize) {
      const chunk = fields.slice(i, i + chunkSize);
      const pageNum = Math.floor(i / chunkSize) + 1;
      const totalPages = Math.ceil(fields.length / chunkSize);

      embeds.push(
        new EmbedBuilder()
          .setTitle(
            `${user.displayName}'s Challenges${totalPages > 1 ? ` (Page ${pageNum}/${totalPages})` : ""}`,
          )
          .setColor(0xc100ff)
          .setThumbnail(user.displayAvatarURL())
          .addFields(chunk),
      );
    }

    return embeds;
  },

  buildDeleteButtons(challenges) {
    // Create buttons for each challenge to remove
    const buttons = challenges.map((c) =>
      new ButtonBuilder()
        .setCustomId(c.id.toString())
        .setLabel(`Remove: ${c.name}`)
        .setStyle(ButtonStyle.Danger),
    );

    // Split buttons into rows (max 5 per row)
    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      const chunk = buttons.slice(i, i + 5);
      rows.push(new ActionRowBuilder().addComponents(chunk));
    }

    return rows;
  },

  buildChallengeRemovedEmbed(user, challenge) {
    return new EmbedBuilder()
      .setTitle("Challenge Removed")
      .setColor(0xc100ff)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(
        `**${user.displayName}** has removed their '${challenge.name}' challenge.`,
      );
  },
};

module.exports = challengePresentation;
