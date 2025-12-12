const { Events } = require("discord.js");
const adminDb = require("../../features/admin/data/admindb");
const wrappedDb = require("../../features/wrapped/data/wrappeddb");

async function replyToPurple(message) {
  const randomChance = Math.floor(Math.random() * 100);
  if (randomChance != 49) {
    return;
  }

  const db = await adminDb.Admin.findOne({ where: { singleid: 0 } });
  if (!db || !db.shamedroleid || !db.allowbotshamereplies) {
    return;
  }

  const guild = message.guild;

  const member = await guild.members.fetch(message.author.id);
  const isShamed = member.roles.cache.hasAny(db.shamedroleid);

  if (isShamed) {
    const purpleGifs = [
      "https://tenor.com/vic7L020lDK.gif",
      "https://tenor.com/l6oqJ9iDRfL.gif",
      "https://tenor.com/mFIwVr0A2fU.gif",
      "https://tenor.com/nolK9fGBJ78.gif",
      "https://tenor.com/vFdJ38rZYOC.gif",
      "https://tenor.com/mMZ1Hbx1C7w.gif",
    ];
    const selectedGif =
      purpleGifs[Math.floor(Math.random() * purpleGifs.length)];
    message.reply({ content: selectedGif });
  }
}

async function trackMessage(message) {
  if (message.author.bot) {
    return;
  }

  const [db, created] = await wrappedDb.Wrapped.findOrCreate({
    where: { userid: message.author.id },
  });

  const messageContent = message.content.toLowerCase();
  const newMessageCount = db.messagecount + 1;
  const isGameText = messageContent === "i lost" || messageContent === "lost";
  const newTimesLost = isGameText ? db.timeslost + 1 : db.timeslost;

  db.set({
    messagecount: newMessageCount,
    timeslost: newTimesLost,
  });

  await db.save();
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    replyToPurple(message);
    trackMessage(message);
  },
};
