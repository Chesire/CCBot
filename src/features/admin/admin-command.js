const { SlashCommandBuilder, ChannelType } = require("discord.js");
const adminDb = require("./data/admindb");

const data = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("Interact with the admin console")
  .addSubcommand((subCommand) =>
    subCommand
      .setName("allow-bot-shame-replies")
      .setDescription("Allows the bot to reply to shamed users")
      .addBooleanOption((option) =>
        option
          .setName("allow")
          .setDescription("Is bot allowed to send replies to shamed")
          .setRequired(true),
      ),
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("set-challenge-channel")
      .setDescription("Sets the channel send challenge reminders")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Name of the channel to send challenge reminders to")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      ),
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("set-shamed-role")
      .setDescription("Set the role to use for the shamed one")
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The role to use to notify for shamed one reminders")
          .setRequired(true),
      ),
  );

async function allowBotShameReplies(interaction) {
  const allowed = interaction.options.getBoolean("allow");
  const rows = await adminDb.Admin.update(
    { allowbotshamereplies: allowed },
    { where: { singleid: 0 } },
  );
  if (rows == 0) {
    buildDefaultDb();
    await adminDb.Admin.update(
      { allowbotshamereplies: allowed },
      { where: { singleid: 0 } },
    );
  }
  if (allowed) {
    await interaction.reply("Bot can now post replies to shamed users");
  } else {
    await interaction.reply("Bot can no longer post replies to shamed users");
  }
}

async function setChallengeChannel(interaction) {
  const channel = interaction.options.getChannel("channel");
  const savedId = channel.id.toString();
  console.debug(`Saving channel id ${savedId}`);

  const rows = await adminDb.Admin.update(
    { challengechannelid: savedId },
    { where: { singleid: 0 } },
  );
  if (rows == 0) {
    buildDefaultDb();
    await adminDb.Admin.update(
      { challengechannelid: savedId },
      { where: { singleid: 0 } },
    );
  }
  await interaction.reply(
    `Challenge reminders will now be sent to <#${savedId}>`,
  );
}

async function setShamedOneRole(interaction) {
  const role = interaction.options.getRole("role");
  const savedId = role.id.toString();
  console.debug(`Saving role id ${savedId}`);

  const rows = await adminDb.Admin.update(
    { shamedroleid: savedId },
    { where: { singleid: 0 } },
  );
  if (rows == 0) {
    buildDefaultDb();
    await adminDb.Admin.update(
      { shamedroleid: savedId },
      { where: { singleid: 0 } },
    );
  }
  await interaction.reply(`Shamed one role has been set to <@&${savedId}>`);
}

async function buildDefaultDb() {
  await adminDb.Admin.create({
    singleid: 0,
    challengechannelid: "0",
    shamedroleid: "0",
  });
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === "allow-bot-shame-replies") {
      allowBotShameReplies(interaction);
    } else if (subCommand === "set-challenge-channel") {
      setChallengeChannel(interaction);
    } else if (subCommand === "set-shamed-role") {
      setShamedOneRole(interaction);
    } else {
      await interaction.reply("Unknown command");
    }
  },
};
