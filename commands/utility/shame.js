const { SlashCommandBuilder } = require('discord.js');
const adminDb = require('../../db/admindb');
const wrappedDb = require('../../db/wrappeddb');

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
