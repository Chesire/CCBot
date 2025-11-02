const { SlashCommandBuilder, ChannelType } = require('discord.js');
const adminDb = require('../database/admindb');
const shameEventsDb = require('../database/shameeventsdb');

const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Interact with the admin console')
  .addSubcommand(subCommand =>
    subCommand
      .setName('allow-bot-shame-replies')
      .setDescription('Allows the bot to reply to shamed users')
      .addBooleanOption(option =>
        option
          .setName('allow')
          .setDescription('Is bot allowed to send replies to shamed')
          .setRequired(true)
      )
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('set-challenge-channel')
      .setDescription('Sets the channel send challenge reminders')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Name of the channel to send challenge reminders to')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('show-challenge-channel')
      .setDescription('Shows which channel gets challenge reminders')
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('set-shamed-role')
      .setDescription('Set the role to use for the shamed one')
      .addRoleOption(option =>
        option
        .setName('role')
        .setDescription('The role to use to notify for shamed one reminders')
        .setRequired(true)
    )
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('show-shamed-role')
      .setDescription('Shows which role is for the shamed')
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('initialize-users')
      .setDescription('Add all users to event database with value 0 if not already present')
  );

async function allowBotShameReplies(interaction) {
  const allowed = interaction.options.getBoolean('allow');
  const rows = await adminDb.Admin.update({ allowbotshamereplies: allowed }, { where: { singleid: 0 } });
  if (rows == 0) {
    buildDefaultDb();
    await adminDb.Admin.update({ allowbotshamereplies: allowed }, { where: { singleid: 0 } });
  }
  if (allowed) {
    await interaction.reply('Bot can now post replies to shamed users');
  } else {
    await interaction.reply('Bot can no longer post replies to shamed users');
  }
}

async function setChallengeChannel(interaction) {
  const channel = interaction.options.getChannel('channel');
  const savedId = channel.id.toString();
  console.debug(`Saving channel id ${savedId}`);

  const rows = await adminDb.Admin.update({ challengechannelid: savedId }, { where: { singleid: 0 } });
  if (rows == 0) {
    buildDefaultDb();
    await adminDb.Admin.update({ challengechannelid: savedId }, { where: { singleid: 0 } });
  }
  await interaction.reply(`Challenge reminders will now be sent to <#${savedId}>`);
}

async function showChallengeChannel(interaction) {
  const db = await adminDb.Admin.findOne({ where: { singleid: 0 } });
  if (db) {
    await interaction.reply(`The channel for challenge reminders is <#${db.challengechannelid}>`);
  } else {
    await interaction.reply('No channel has been set');
  }
}

async function setShamedOneRole(interaction) {
  const role = interaction.options.getRole('role');
  const savedId = role.id.toString();
  console.debug(`Saving role id ${savedId}`);

  const rows = await adminDb.Admin.update({ shamedroleid: savedId }, { where: { singleid: 0 } });
  if (rows == 0) {
    buildDefaultDb();
    await adminDb.Admin.update({ shamedroleid: savedId }, { where: { singleid: 0 } });
  }
  await interaction.reply(`Shamed one role has been set to <@&${savedId}>`);
}

async function showShamedOneRole(interaction) {
  const db = await adminDb.Admin.findOne({ where: { singleid: 0 } });
  if (db) {
    await interaction.reply(`The role for the shamed <@&${db.shamedroleid}>`);
  } else {
    await interaction.reply('No role has been set');
  }
}

async function initializeUsers(interaction) {
  await interaction.deferReply();

  try {
    const guild = interaction.guild;
    const members = await guild.members.fetch({ force: true });
    console.log(`Initializing ${members.size} members in shame event database`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const member of members.values()) {
      const userId = member.id;
      const existing = await shameEventsDb.ShameEvents.findOne({ where: { userid: userId } });

      if (!existing) {
        await shameEventsDb.ShameEvents.create({
          userid: userId,
          eventid: '0'
        });
        addedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`User initialization complete. Added: ${addedCount}, Skipped: ${skippedCount}`);
    await interaction.editReply(`Initialized ${addedCount} new users in the database. (${skippedCount} already existed)`);
  } catch (error) {
    console.error('Error initializing users:', error);
    await interaction.editReply('An error occurred while initializing users.');
  }
}

async function buildDefaultDb() {
  await adminDb.Admin.create({
    singleid: 0,
    challengechannelid: '0',
    shamedroleid: '0'
  });
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'allow-bot-shame-replies') {
      allowBotShameReplies(interaction);
    } else if (subCommand === 'set-challenge-channel') {
      setChallengeChannel(interaction);
    } else if (subCommand === 'set-shamed-role') {
      setShamedOneRole(interaction);
    } else if (subCommand === 'show-challenge-channel') {
      showChallengeChannel(interaction);
    } else if (subCommand === 'show-shamed-role') {
      showShamedOneRole(interaction);
    } else if (subCommand === 'initialize-users') {
      initializeUsers(interaction);
    } else {
      await interaction.reply('Unknown command');
    }
  }
};
