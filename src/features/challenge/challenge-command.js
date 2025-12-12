const { SlashCommandBuilder } = require("discord.js");
const challengePresentation = require("./presentation/challenge-presentation");
const challengeService = require("./service/challenge-service");

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
  console.log(`[ChallengeCommand] attempting to add a new challenge`);

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

    console.log(`[ChallengeCommand] added a new challenge`);
    const embed = challengePresentation.buildAddChallengeEmbed(
      interaction.user,
      challenge,
    );
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.log(
      `[ChallengeCommand] tried to add a challenge, but an error occurred. ${error}`,
    );
    await interaction.reply(error.message);
  }
}

async function listUserChallenges(interaction) {
  const target = interaction.options.getUser("target");
  console.log(
    `[ChallengeCommand] attempting to list challenges for user ${target.displayName}`,
  );

  const challenges = await challengeService.listUserChallenges(target.id);

  if (challenges.length === 0) {
    const embed = challengePresentation.buildEmptyListChallengeEmbed(target);
    console.log(
      `[ChallengeCommand] listed challenges for ${target.displayName} who has none`,
    );
    await interaction.reply({ embeds: [embed] });
  } else {
    const embeds = challengePresentation.buildListChallengesEmbed(
      target,
      challenges,
    );
    console.log(
      `[ChallengeCommand] listed ${challenges.length} challenge(s) for ${target.displayName}`,
    );
    await interaction.reply({ embeds: embeds });
  }
}

async function removeChallenge(interaction) {
  console.log(`[ChallengeCommand] attempting to remove a challenge`);
  const targetUser = interaction.user;
  const challenges = await challengeService.listUserChallenges(targetUser.id);
  if (challenges.length == 0) {
    console.log(`[ChallengeCommand] no challenges to remove for user`);
    await interaction.reply({
      content: "Could not find any challenges for you",
      ephemeral: true,
    });
    return;
  }

  const embeds = challengePresentation.buildListChallengesEmbed(
    targetUser,
    challenges,
  );
  const rows = challengePresentation.buildDeleteButtons(challenges);
  const response = await interaction.reply({
    embeds: embeds,
    components: rows,
    ephemeral: true,
  });

  var confirmation;
  try {
    const collectorFilter = (i) => i.user.id === interaction.user.id;
    confirmation = await response.awaitMessageComponent({
      filter: collectorFilter,
      time: 60_000,
    });
  } catch {
    console.log(`[ChallengeCommand] did not confirm challenge removal in time`);
    await interaction.editReply({
      content: "Confirmation not received within 1 minute, cancelling",
      components: [],
      ephemeral: true,
    });
    return;
  }

  try {
    const removedChallenge = await challengeService.removeChallenge(
      parseInt(confirmation.customId),
    );
    const deleteEmbed = challengePresentation.buildChallengeRemovedEmbed(
      interaction.user,
      removedChallenge,
    );

    console.log(
      `[ChallengeCommand] removed challenge '${removedChallenge.name}'`,
    );
    await confirmation.deferUpdate();
    await response.delete();
    await interaction.channel.send({ embeds: [deleteEmbed] });
  } catch (error) {
    console.log(
      `[ChallengeCommand] tried to remove challenge '${confirmation.customId}' but failed`,
    );
    await confirmation.update({
      content: "Failed to remove challenge, try again",
      components: [],
      ephemeral: true,
    });
  }
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    console.log(
      `[ChallengeCommand][caller:${interaction.user.displayName}] used challenge subcommand '${interaction.options.getSubcommand()}'`,
    );
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === "add") {
      await addChallenge(interaction);
    } else if (subCommand === "list-user") {
      await listUserChallenges(interaction);
    } else if (subCommand === "remove") {
      await removeChallenge(interaction);
    } else {
      await interaction.reply("Invalid option");
    }
  },
};
