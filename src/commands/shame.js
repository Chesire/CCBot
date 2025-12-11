const { SlashCommandBuilder, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } = require('discord.js');
const adminDb = require('../database/admindb');
const shameEventsDb = require('../database/shameeventsdb');
const wrappedDb = require('../database/wrappeddb');

const weekExtra = 7 * 24 * 60 * 60 * 1000;

const data = new SlashCommandBuilder()
  .setName('shame')
  .setDescription('Shame or unshame somebody')
  .addSubcommand(subCommand =>
    subCommand
      .setName('add')
      .setDescription('Sets a user as shamed')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('Which user to shame')
          .setRequired(true)
      )
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('remove')
      .setDescription('Removes a user as shamed')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('Which user to unshame')
          .setRequired(true)
      )
  );

async function shame(interaction) {
  const db = await adminDb.Admin.findOne({ where: { singleid: 0 } });
  if (!db || !db.shamedroleid) {
    await interaction.reply('No role set');
    return;
  }
  const user = interaction.options.getUser('user');
  const guild = interaction.guild;
  const role = await guild.roles.fetch(db.shamedroleid);
  const member = await guild.members.fetch(user.id);

  await member.roles.add(role);

  const [wrapped, created] = await wrappedDb.Wrapped.findOrCreate({
    where: { userid: user.id }
  });
  const missedChallenges = wrapped.missedchallenges + 1;
  const shamedCount = member.roles.cache.some(roleCache => roleCache.id === db.shamedroleid) ?
    wrapped.shamedcount :
    wrapped.shamedcount + 1;
  wrapped.set({
    missedchallenges: missedChallenges,
    shamedcount : shamedCount
  });
  await wrapped.save();
  await handleEvent(guild, user);

  const shameGifs = [
    'https://tenor.com/VU1y.gif',
    'https://tenor.com/xV7I.gif',
    'https://tenor.com/bSiK8.gif',
    'https://tenor.com/bLQnA.gif',
    'https://tenor.com/uDmFdQcabLN.gif'
  ];
  const selectedGif = shameGifs[Math.floor(Math.random() * shameGifs.length)];

  await interaction.reply(`SHAME <@${user.id}> SHAME\n${selectedGif}`);
}

async function handleEvent(guild, user) {
  const previousEventTable = await shameEventsDb.ShameEvents.findOne({ where: { userid: user.id } });
  if (previousEventTable) {
    try {
      const previousEvent = await guild.scheduledEvents.fetch({ guildScheduledEvent: previousEventTable.eventid });
      if (previousEvent) {
        await updateEvent(previousEvent);
        return;
      }
    } catch (exception) {
      console.log(`Exception occurred updating: ${exception}\nRemoving the current stored value and creating new`);
      shameEventsDb.ShameEvents.destroy({ where: { userid: user.id } });
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

  console.log(`previousStart - ${previousStart}\nnewStartDate - ${newStartDate}\npreviousEnd ${previousEnd}\nnewEndDate - ${newEndDate}`);

  await event.edit({
    scheduledStartTime: newStartDate,
    scheduledEndTime: newEndDate
  });
}

async function createEvent(guild, user) {
  console.log('No previous event, creating new one');
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
      location: ''
    },
    reason: ''
  });

  await shameEventsDb.ShameEvents.create({
    userid: user.id,
    eventid: newEvent.id
  });
}

async function unshame(interaction) {
  const db = await adminDb.Admin.findOne({ where: { singleid: 0 } });
  if (!db || !db.shamedroleid) {
    await interaction.reply('No role set');
    return;
  }
  const user = interaction.options.getUser('user');
  const guild = interaction.guild;
  const role = await guild.roles.fetch(db.shamedroleid);
  const member = await guild.members.fetch(user.id);
  await member.roles.remove(role);

  await interaction.reply(`<@${user.id}>, you are free`);
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'add') {
      shame(interaction);
    } else if (subCommand === 'remove') {
      unshame(interaction);
    } else {
      await interaction.reply('Unknown command');
    }
  }
};
