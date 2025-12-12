const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const challengedb = require("./data/challengedb");
const challengeService = require("../challenge/service/challenge-service");

const data = new SlashCommandBuilder()
  .setName("challenge")
  .setDescription("Interact with challenges")
  .addSubcommand((subCommand) =>
    subCommand
      .setName("add")
      .setDescription("Adds a challenge for a user")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Give the challenge a short name")
          .setMaxLength(20)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("Description of the challenge being done")
          .setMaxLength(200)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("time-frame")
          .setDescription("What is the time frame the challenge occurs in?")
          .setRequired(true)
          .addChoices(
            { name: "Daily", value: "daily" },
            { name: "Weekly", value: "weekly" },
            { name: "Monthly", value: "monthly" },
          ),
      )
      .addNumberOption((option) =>
        option
          .setName("cheats")
          .setDescription("How many cheat days are allowed in each time frame?")
          .setMinValue(0)
          .setMaxValue(4)
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName("allow-pause")
          .setDescription("Are pauses allowed for special occasions?")
          .setRequired(true),
      ),
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("list-user")
      .setDescription("Lists users challenges")
      .addUserOption((option) =>
        option.setName("target").setDescription("The user").setRequired(true),
      ),
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("remove")
      .setDescription("Removes a challenge from a user"),
  );

async function addChallenge(interaction) {
  console.log(
    `[ChallengeCommand][caller:${interaction.user.displayName}] is attempting to add a new challenge`,
  );

  try {
    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");
    const timeFrame = interaction.options.getString("time-frame");
    const cheats = interaction.options.getNumber("cheats");
    const allowPause = interaction.options.getBoolean("allow-pause");

    const challenge = await challengeService.addChallenge(
      { id: interaction.user.id, displayName: interaction.user.displayName },
      {
        name: name,
        description: description,
        timeFrame: timeFrame,
        cheats: cheats,
        allowPause: allowPause,
      },
    );

    console.log(
      `[ChallengeCommand][caller:${interaction.user.displayName}] added a new challenge`,
    );
    const embed = _buildAddChallengeEmbed(interaction.user, challenge);
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.log(
      `[ChallengeCommand][caller:${interaction.user.displayName}] tried to add a challenge, but an error occurred. ${error}`,
    );
    await interaction.reply(error.message);
  }
}

function _buildAddChallengeEmbed(user, challenge) {
  const timeFrameString =
    timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1);
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
}

async function listUserChallenges(interaction) {
  const target = interaction.options.getUser("target");
  console.log(
    `[ChallengeCommand][caller:${interaction.user.displayName}] is attempting to list challenges for user ${target.displayName}`,
  );

  const challenges = await challengeService.listUserChallenges(target.id);

  if (challenges.length == 0) {
    const embed = _buildEmptyListChallengeEmbed(target);
    console.log(
      `[ChallengeCommand][caller:${interaction.user.displayName}] listed challenges for ${target.displayName} who has none`,
    );
    await interaction.reply({ embeds: [embed] });
  } else {
    const embeds = _buildListChallengesEmbed(target, challenges);
    console.log(
      `[ChallengeCommand][caller:${interaction.user.displayName}] listed ${challenges.length} challenge(s) for ${target.displayName}`,
    );
    await interaction.reply({ embeds: embeds });
  }
}

function _buildEmptyListChallengeEmbed(user) {
  return new EmbedBuilder()
    .setTitle("User Challenges")
    .setColor(0xc100ff)
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`**${user.displayName}** has no active challenges.`);
}

function _buildListChallengesEmbed(user, challenges) {
  const fields = challenges.map((c) => ({
    name: c.name,
    value: `**Description:** ${c.description}\n**Timeframe:** ${c.timeframe.charAt(0).toUpperCase() + c.timeframe.slice(1)}\n**Cheats Allowed:** ${c.cheats}\n**Pauses Allowed:** ${c.allowpause ? "Yes" : "No"}`,
    inline: false,
  }));

  // Split fields into chunks of 25 (Discord's field limit per embed)
  const embeds = [];
  for (let i = 0; i < fields.length; i += 25) {
    const chunk = fields.slice(i, i + 25);
    const pageNum = Math.floor(i / 25) + 1;
    const totalPages = Math.ceil(fields.length / 25);

    embeds.push(
      new EmbedBuilder()
        .setTitle(
          `${user.displayName}'s Challenges${totalPages > 1 ? ` (Page ${pageNum}/${totalPages})` : ""}`,
        )
        .setColor(0xc100ff)
        .setThumbnail(target.displayAvatarURL())
        .addFields(chunk),
    );
  }
}

async function removeChallenge(interaction) {
  const targetUser = interaction.user;
  const challenges = await challengedb.Challenges.findAll({
    where: { userid: targetUser.id },
  });
  if (challenges.length == 0) {
    console.log(
      `[Challenge][caller:${interaction.user.displayName}] No challenges to remove for user`,
    );
    await interaction.reply({
      content: "Could not find any challenges for you",
      ephemeral: true,
    });
  } else {
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
            `${targetUser.displayName}'s Challenges${totalPages > 1 ? ` (Page ${pageNum}/${totalPages})` : ""}`,
          )
          .setColor(0xc100ff)
          .setThumbnail(targetUser.displayAvatarURL())
          .addFields(chunk),
      );
    }

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

    const response = await interaction.reply({
      embeds: embeds,
      components: rows,
      ephemeral: true,
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60_000,
      });
      const challenge = await challengedb.Challenges.findOne({
        where: { id: parseInt(confirmation.customId) },
      });
      if (challenge) {
        await challengedb.Challenges.destroy({
          where: { id: parseInt(confirmation.customId) },
        });
        console.log(
          `[Challenge][caller:${interaction.user.displayName}] Removed challenge '${challenge.name}'`,
        );

        const deleteEmbed = new EmbedBuilder()
          .setTitle("Challenge Removed")
          .setColor(0xc100ff)
          .setThumbnail(targetUser.displayAvatarURL())
          .setDescription(
            `**${targetUser.displayName}** has removed their '${challenge.name}' challenge.`,
          );

        await confirmation.deferUpdate();
        await response.delete();
        await interaction.channel.send({ embeds: [deleteEmbed] });
      } else {
        console.log(
          `[Challenge][caller:${interaction.user.displayName}] Tried to remove challenge '${confirmation.customId}' but challenge came back null`,
        );
        await confirmation.update({
          content: "Failed to remove challenge, try again",
          components: [],
          ephemeral: true,
        });
      }
    } catch {
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
        ephemeral: true,
      });
    }
  }
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    console.log(
      `[Challenge][caller:${interaction.user.displayName}] Used challenge subcommand '${interaction.options.getSubcommand()}'`,
    );
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === "add") {
      await addChallenge(interaction);
    } else if (subCommand === "list-user") {
      listUserChallenges(interaction);
    } else if (subCommand === "remove") {
      removeChallenge(interaction);
    } else {
      await interaction.reply("Invalid option");
    }
  },
};
