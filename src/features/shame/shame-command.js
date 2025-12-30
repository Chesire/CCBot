const {
  SlashCommandBuilder,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} = require("discord.js");
const adminRepository = require("../admin/data/admin-repository");
const shameEventsDb = require("./data/shameeventsdb");
const {
  eventService,
  USER_EVENT_TYPES,
} = require("../../core/services/event-service");

const weekExtra = 7 * 24 * 60 * 60 * 1000;

const shameGifs = [
  "https://tenor.com/VU1y.gif",
  "https://tenor.com/xV7I.gif",
  "https://tenor.com/bSiK8.gif",
  "https://tenor.com/bLQnA.gif",
  "https://tenor.com/uDmFdQcabLN.gif",
];

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
  const shamedRoleId = await adminRepository.shamedRoleId.get();
  if (adminRepository.shamedRoleId.isDefault(shamedRoleId)) {
    await interaction.reply("No role set");
    return;
  }

  const user = interaction.options.getUser("user");
  const guild = interaction.guild;
  const role = await guild.roles.fetch(shamedRoleId);
  const member = await guild.members.fetch(user.id);

  const isNewlyShamed = !member.roles.cache.some(
    (roleCache) => roleCache.id === shamedRoleId,
  );

  await member.roles.add(role);

  await trackUserMissedChallenge(user.id);
  await trackUserShamed(isNewlyShamed, user.id);

  await handleEvent(guild, user);

  const selectedGif = shameGifs[Math.floor(Math.random() * shameGifs.length)];

  await interaction.reply(`SHAME <@${user.id}> SHAME\n${selectedGif}`);
}

async function trackUserMissedChallenge(userId) {
  await eventService.incrementUserEventCount(
    userId,
    USER_EVENT_TYPES.USER_MISSED_CHALLENGES,
  );
}

async function trackUserShamed(isNewlyShamed, userId) {
  if (isNewlyShamed) {
    await eventService.incrementUserEventCount(
      userId,
      USER_EVENT_TYPES.USER_SHAMED_COUNT,
    );
  }
}

async function handleEvent(guild, user) {
  const previousEventTable = await shameEventsDb.ShameEvents.findOne({
    where: { userid: user.id },
  });
  if (previousEventTable) {
    try {
      const previousEvent = await guild.scheduledEvents.fetch({
        guildScheduledEvent: previousEventTable.eventid,
      });
      if (previousEvent) {
        await updateEvent(previousEvent);
        return;
      }
    } catch (exception) {
      console.log(
        `Exception occurred updating: ${exception}\nRemoving the current stored value and creating new`,
      );
      await shameEventsDb.ShameEvents.destroy({ where: { userid: user.id } });
    }
  }
  // if no previous event, create a new one.
  await createEvent(guild, user);
}

async function updateEvent(event) {
  console.log(`Found previous event to update - ${event}`);

  const previousStart = new Date(event.scheduledStartAt);
  const newStartDate = new Date(previousStart.getTime() + weekExtra);
  const previousEnd = new Date(event.scheduledEndAt);
  const newEndDate = new Date(previousEnd.getTime() + weekExtra + 1000);

  console.log(
    `previousStart - ${previousStart}\nnewStartDate - ${newStartDate}\npreviousEnd ${previousEnd}\nnewEndDate - ${newEndDate}`,
  );

  await event.edit({
    scheduledStartTime: newStartDate,
    scheduledEndTime: newEndDate,
  });
}

async function createEvent(guild, user) {
  console.log("No previous event, creating new one");
  const startDate = new Date(Date.now() + weekExtra);
  const endDate = new Date(Date.now() + weekExtra + 1000);

  const newEvent = await guild.scheduledEvents.create({
    name: `${user.displayName}s period of shame ends`,
    scheduledStartTime: startDate,
    scheduledEndTime: endDate,
    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
    description: `Event for when the shame of ${user.displayName} has come to an end.`,
    entityType: GuildScheduledEventEntityType.External,
    entityMetadata: {
      location: "",
    },
    reason: "",
  });

  await shameEventsDb.ShameEvents.create({
    userid: user.id,
    eventid: newEvent.id,
  });
}

async function unshame(interaction) {
  const shamedRoleId = await adminRepository.shamedRoleId.get();
  if (adminRepository.shamedRoleId.isDefault(shamedRoleId)) {
    await interaction.reply("No role set");
    return;
  }
  const user = interaction.options.getUser("user");
  const guild = interaction.guild;
  const role = await guild.roles.fetch(shamedRoleId);
  const member = await guild.members.fetch(user.id);
  await member.roles.remove(role);

  await interaction.reply(`<@${user.id}>, you are free`);
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === "add") {
      shame(interaction);
    } else if (subCommand === "remove") {
      unshame(interaction);
    } else {
      await interaction.reply("Unknown command");
    }
  },
};
