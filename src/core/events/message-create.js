const { Events } = require("discord.js");
const adminRepository = require("../../features/admin/data/admin-repository");
const {
  eventService,
  USER_EVENT_TYPES,
  CHANNEL_EVENT_TYPES,
} = require("../services/event-service");

const purpleGifs = [
  "https://tenor.com/vic7L020lDK.gif",
  "https://tenor.com/l6oqJ9iDRfL.gif",
  "https://tenor.com/mFIwVr0A2fU.gif",
  "https://tenor.com/nolK9fGBJ78.gif",
  "https://tenor.com/vFdJ38rZYOC.gif",
  "https://tenor.com/mMZ1Hbx1C7w.gif",
  "https://tenor.com/view/shut-up-purple-role-toji-gif-11710272326321885815",
  "https://tenor.com/view/sukuna-purple-role-jujutsu-role-jujutsu-kaisen-gif-17152838314173947867",
  "https://tenor.com/view/roleism-roleist-purple-role-kenjaku-gif-6349955512647677456",
];

async function replyToPurple(message) {
  const randomChance = Math.floor(Math.random() * 100);
  if (randomChance != 49) {
    return;
  }

  const shamedRoleId = await adminRepository.shamedRoleId.get();
  const allowBotShameReplies = await adminRepository.allowBotShameReplies.get();
  if (
    adminRepository.shamedRoleId.isDefault(shamedRoleId) ||
    !allowBotShameReplies
  ) {
    return;
  }

  const guild = message.guild;
  const member = await guild.members.fetch(message.author.id);
  const isShamed = member.roles.cache.hasAny(shamedRoleId);

  if (isShamed) {
    const selectedGif =
      purpleGifs[Math.floor(Math.random() * purpleGifs.length)];
    message.reply({ content: selectedGif });
  }
}

async function trackMessage(message) {
  if (message.author.bot) {
    return;
  }

  await trackUserMessageCreated(message);
  await trackChannelMessageCreated(message);
  await trackLostMessage(message);
}

async function trackUserMessageCreated(message) {
  await eventService.incrementUserEventCount(
    message.author.id,
    USER_EVENT_TYPES.USER_MESSAGE_COUNT,
  );
}

async function trackChannelMessageCreated(message) {
  await eventService.incrementChannelEventCount(
    message.channel.id,
    CHANNEL_EVENT_TYPES.CHANNEL_MESSAGE_COUNT,
  );
}

async function trackLostMessage(message) {
  const messageContent = message.content.toLowerCase();
  if (messageContent === "i lost" || messageContent === "lost") {
    await eventService.incrementUserEventCount(
      message.author.id,
      USER_EVENT_TYPES.USER_TIMES_LOST,
    );
  }
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    await replyToPurple(message);
    await trackMessage(message);
  },
};
