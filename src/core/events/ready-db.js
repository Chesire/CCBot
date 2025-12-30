const { Events } = require("discord.js");
const admindb = require("../../features/admin/data/admindb");
const adminRepository = require("../../features/admin/data/admin-repository");
const challengedb = require("../../features/challenge/data/challengedb");
const eventdb = require("../../core/data/eventdb");
const shameeventsdb = require("../../features/shame/data/shameeventsdb");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`[ReadyDB] ${client.user.tag} ready. Syncing dbs!`);

    console.log(`[ReadyDB] syncing Admin db`);
    await admindb.Admin.sync({ alter: true });
    await adminRepository.initialize();

    console.log(`[ReadyDB] syncing Challenge db`);
    await challengedb.Challenges.sync({ alter: true });

    console.log(`[ReadyDB] syncing ShameEvents db`);
    await shameeventsdb.ShameEvents.sync({ alter: true });

    console.log(`[ReadyDB] syncing Event db`);
    await eventdb.UserYearEvent.sync({ alter: true });
    await eventdb.ChannelYearEvent.sync({ alter: true });

    console.log("[ReadyDB] dbs Synced!");
  },
};
