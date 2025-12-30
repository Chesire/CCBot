const {
  SlashCommandBuilder,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} = require("discord.js");
const adminRepository = require("../admin/data/admin-repository");
const shameEventsDb = require("./data/shameeventsdb");
const shameService = require("./service/shame-service");
const {
  eventService,
  USER_EVENT_TYPES,
} = require("../../core/services/event-service");
const shamePresentation = require("../shame/presentation/shame-presentation.js");

const weekExtra = 7 * 24 * 60 * 60 * 1000;

const data = new SlashCommandBuilder()
  .setName("shame")
  .setDescription("Shame or unshame somebody")
  .addSubcommand((subCommand) =>
    subCommand
      .setName("add")
      .setDescription("Sets a user as shamed")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Which user to shame")
          .setRequired(true),
      ),
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("remove")
      .setDescription("Removes a user as shamed")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Which user to unshame")
          .setRequired(true),
      ),
  );

async function shame(interaction) {
  const user = interaction.options.getUser("user");

  if (shameService.shameUser(user.id, interaction.guild)) {
    await interaction.reply(shamePresentation.getShameMessage(user.id));
  } else {
    await interaction.reply(shamePresentation.getNoRoleError());
  }
}

async function unshame(interaction) {
  const user = interaction.options.getUser("user");

  if (await shameService.unshameUser(user.id, interaction.guild)) {
    await interaction.reply(shamePresentation.getUnshamedMessage(user.id));
  } else {
    await interaction.reply(shamePresentation.getNoRoleError());
  }
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === "add") {
      await shame(interaction);
    } else if (subCommand === "remove") {
      await unshame(interaction);
    } else {
      await interaction.reply("Unknown command");
    }
  },
};
