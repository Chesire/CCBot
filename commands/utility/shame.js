const { SlashCommandBuilder } = require('discord.js');
const adminDb = require('../../db/admindb');

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

    await interaction.reply(`SHAME <@${user.id}> SHAME\nhttps://tenor.com/VU1y.gif`);
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
