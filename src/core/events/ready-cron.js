const { Events } = require("discord.js");
const cron = require("cron");
const token = require("../../../config.json");
const adminRepository = require("../../features/admin/data/admin-repository");
const challengedb = require("../../features/challenge/data/challengedb");

async function fireDailyCron(client) {
  console.log("[ReadyCron] starting day cron");
  const challenges = await _getChallenges("daily");
  if (challenges.length > 0) {
    await _sendChallengeReminders(client, challenges, "yesterday");
  }
}

async function fireWeeklyCron(client) {
  console.log("[ReadyCron] starting week cron");
  const challenges = await _getChallenges("weekly");
  if (challenges.length > 0) {
    await _sendChallengeReminders(client, challenges, "last week");
  }
}

async function fireMonthlyCron(client) {
  console.log("[ReadyCron] starting month cron");
  const challenges = await _getChallenges("monthly");
  if (challenges.length > 0) {
    await _sendChallengeReminders(client, challenges, "last month");
  }
}

async function _getChallenges(timeFrame) {
  const challenges = await challengedb.Challenges.findAll({
    where: { timeframe: timeFrame },
  });

  console.log(`[ReadyCron] found ${challenges.length} challenges`);
  return challenges;
}

async function _sendChallengeReminders(client, challenges, timeString) {
  const guild = await client.guilds.cache.get(token.guildId);
  const challengeChannelId = await adminRepository.challengeChannelId.get();
  const channel = await guild.channels.cache.get(challengeChannelId);

  const challengesString = challenges
    .map(
      (c) =>
        `<@${c.userid}>, did you complete your ${c.name} challenge ${timeString}?`,
    )
    .join("\n");

  await channel.send(`${challengesString}`);
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`${client.user.tag} ready. Starting cron jobs!`);
    const dailyMessage = new cron.CronJob("00 00 07 * * *", () => {
      // This runs every day at 7:00:00
      fireDailyCron(client);
    });
    const weeklyMessage = new cron.CronJob("00 00 07 * * mon", () => {
      // This runs every week on Monday at 7:00:00
      fireWeeklyCron(client);
    });
    const monthlyMessage = new cron.CronJob("00 00 07 01 * *", () => {
      // This runs the first of the month at 7:00:00
      fireMonthlyCron(client);
    });

    dailyMessage.start();
    weeklyMessage.start();
    monthlyMessage.start();
    console.log("Cron jobs scheduled");
  },
};
