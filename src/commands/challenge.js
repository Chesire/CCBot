const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const challengedb = require('../database/challengedb');

// Maximum that a user can have, change to be server defined in the future.
const challengeLimit = 10;

const data = new SlashCommandBuilder()
  .setName('challenge')
  .setDescription('Interact with challenges')
  .addSubcommand(subCommand =>
    subCommand
      .setName('add')
      .setDescription('Adds a challenge for a user')
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('Give the challenge a short name')
          .setMaxLength(20)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('description')
          .setDescription('Description of the challenge being done')
          .setMaxLength(200)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('time-frame')
          .setDescription('What is the time frame the challenge occurs in?')
          .setRequired(true)
          .addChoices(
            { name: 'Daily', value: 'daily' },
            { name: 'Weekly', value: 'weekly' },
            { name: 'Monthly', value: 'monthly' }
          )
      )
      .addNumberOption(option =>
        option
          .setName('cheats')
          .setDescription('How many cheat days are allowed in each time frame?')
          .setMinValue(0)
          .setMaxValue(4)
          .setRequired(true)
      )
      .addBooleanOption(option =>
        option
          .setName('allow-pause')
          .setDescription('Are pauses allowed for special occasions?')
          .setRequired(true)
      )
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('list-all')
      .setDescription('Lists all users challenges')
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('list-user')
      .setDescription('Lists users challenges')
      .addUserOption(option =>
        option
          .setName('target')
          .setDescription('The user')
          .setRequired(true)
      )
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('remove')
      .setDescription('Removes a challenge from a user')
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('cheat')
      .setDescription('Sets that today is a cheat day')
  )
  .addSubcommand(subCommand =>
    subCommand
      .setName('pause')
      .setDescription('Sets a date for a pause day')
      .addStringOption(option =>
        option
          .setName('reason')
          .setDescription('Why the pause')
          .setRequired(true)
      )
  );

async function addChallenge(interaction) {
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');
  const timeFrame = interaction.options.getString('time-frame');
  const cheats = interaction.options.getNumber('cheats');
  const allowPause = interaction.options.getBoolean('allow-pause');

  try {
    const usersChallenges = await challengedb.Challenges.findAll({ where: { userid: interaction.user.id } });
    if (usersChallenges.length >= challengeLimit) {
      await interaction.reply('Too many challenges active, delete one to add another.');
    } else {
      await challengedb.Challenges.create({
        name: name,
        description: description,
        timeframe: timeFrame,
        username: interaction.user.displayName,
        userid: interaction.user.id.toString(),
        cheats: cheats,
        allowpause: allowPause
      });
      const timeFrameString = timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1);

      const embed = new EmbedBuilder()
        .setTitle('New Challenge')
        .setColor(0xC100FF)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`**${interaction.user.displayName}** has added their '${name}' challenge!`)
        .addFields(
          { name: 'Description', value: description, inline: false },
          { name: 'Time Frame', value: timeFrameString, inline: true },
          { name: 'Cheats Allowed', value: cheats.toString(), inline: true },
          { name: 'Pauses Allowed', value: allowPause ? 'Yes' : 'No', inline: true }
        );

      console.log(`[Challenge][caller:${interaction.user.displayName}] Added a new challenge`);
      await interaction.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.log(`[Challenge][caller:${interaction.user.displayName}] Tried to add a challenge, but an error occurred. ${error}`);
    await interaction.reply('Failed to add a challenge, try again');
  }
}

async function listUserChallenges(interaction) {
  const target = interaction.options.getUser('target');
  const challenges = await challengedb.Challenges.findAll({ where: { userid: target.id } });
  if (challenges.length == 0) {
    console.log(`[Challenge][caller:${interaction.user.displayName}] Listed challenges for ${target.displayName} who has none`);
    const embed = new EmbedBuilder()
      .setTitle('User Challenges')
      .setColor(0xC100FF)
      .setThumbnail(target.displayAvatarURL())
      .setDescription(`**${target.displayName}** has no active challenges.`);
    await interaction.reply({ embeds: [embed] });
  } else {
    const fields = challenges.map(c => ({
      name: c.name,
      value: `**Description:** ${c.description}\n**Timeframe:** ${c.timeframe.charAt(0).toUpperCase() + c.timeframe.slice(1)}\n**Cheats Allowed:** ${c.cheats}\n**Pauses Allowed:** ${c.allowpause ? 'Yes' : 'No'}`,
      inline: false
    }));

    // Split fields into chunks of 25 (Discord's field limit per embed)
    const embeds = [];
    for (let i = 0; i < fields.length; i += 25) {
      const chunk = fields.slice(i, i + 25);
      const pageNum = Math.floor(i / 25) + 1;
      const totalPages = Math.ceil(fields.length / 25);

      embeds.push(new EmbedBuilder()
        .setTitle(`${target.displayName}'s Challenges${totalPages > 1 ? ` (Page ${pageNum}/${totalPages})` : ''}`)
        .setColor(0xC100FF)
        .setThumbnail(target.displayAvatarURL())
        .addFields(chunk)
      );
    }

    console.log(`[Challenge][caller:${interaction.user.displayName}] Listed ${challenges.length} challenge(s) for ${target.displayName}`);
    try {
      await interaction.reply({ embeds: embeds });
    } catch (error) {
      console.error(`[Challenge][caller:${interaction.user.displayName}] Error sending challenge list embeds: ${error}`);
    }
  }
}

async function removeChallenge(interaction) {
  const targetUser = interaction.user;
  const challenges = await challengedb.Challenges.findAll({ where: { userid: targetUser.id } });
  if (challenges.length == 0) {
    console.log(`[Challenge][caller:${interaction.user.displayName}] No challenges to remove for user`);
    await interaction.reply({ content: 'Could not find any challenges for you', ephemeral: true });
  } else {
    const fields = challenges.map(c => ({
      name: c.name,
      value: `**Description:** ${c.description}\n**Timeframe:** ${c.timeframe.charAt(0).toUpperCase() + c.timeframe.slice(1)}\n**Cheats Allowed:** ${c.cheats}\n**Pauses Allowed:** ${c.allowpause ? 'Yes' : 'No'}`,
      inline: false
    }));

    // Split fields into chunks of 25 (Discord's field limit per embed)
    const embeds = [];
    for (let i = 0; i < fields.length; i += 25) {
      const chunk = fields.slice(i, i + 25);
      const pageNum = Math.floor(i / 25) + 1;
      const totalPages = Math.ceil(fields.length / 25);

      embeds.push(new EmbedBuilder()
        .setTitle(`${targetUser.displayName}'s Challenges${totalPages > 1 ? ` (Page ${pageNum}/${totalPages})` : ''}`)
        .setColor(0xC100FF)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(chunk)
      );
    }

    // Create buttons for each challenge to remove
    const buttons = challenges.map(c =>
      new ButtonBuilder()
        .setCustomId(c.id.toString())
        .setLabel(`Remove: ${c.name}`)
        .setStyle(ButtonStyle.Danger)
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
      ephemeral: true
    });

    const collectorFilter = i => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
      const challenge = await challengedb.Challenges.findOne({ where: { id: parseInt(confirmation.customId) } });
      if (challenge) {
        await challengedb.Challenges.destroy({ where: { id: parseInt(confirmation.customId) } });
        console.log(`[Challenge][caller:${interaction.user.displayName}] Removed challenge '${challenge.name}'`);

        const deleteEmbed = new EmbedBuilder()
          .setTitle('Challenge Removed')
          .setColor(0xC100FF)
          .setThumbnail(targetUser.displayAvatarURL())
          .setDescription(`**${targetUser.displayName}** has removed their '${challenge.name}' challenge.`);

        await confirmation.deferUpdate();
        await response.delete();
        await interaction.channel.send({ embeds: [deleteEmbed] });
      } else {
        console.log(`[Challenge][caller:${interaction.user.displayName}] Tried to remove challenge '${challenge.name}' but challenge came back null`);
        await confirmation.update({ content: 'Confirmation not received within 1 minute, cancelling', components: [], ephemeral: true });
      }
    } catch {
      await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [], ephemeral: true });
    }
  }
}

async function cheatDay(interaction) {
  const targetUser = interaction.user;
  await interaction.reply(`${targetUser} is taking today as a cheat day.`);
}

module.exports = {
  cooldown: 5,
  data: data,
  async execute(interaction) {
    console.log(`[Challenge][caller:${interaction.user.displayName}] Used challenge subcommand '${interaction.options.getSubcommand()}'`);
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'add') {
      addChallenge(interaction);
    } else if (subCommand === 'list-user') {
      listUserChallenges(interaction);
    } else if (subCommand === 'remove') {
      removeChallenge(interaction);
    } else if (subCommand === 'cheat') {
      cheatDay(interaction);
    } else {
      await interaction.reply('Invalid option');
    }
  }
};
