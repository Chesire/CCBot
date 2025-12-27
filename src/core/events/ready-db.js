const { Events } = require("discord.js");
const admindb = require("../../features/admin/data/admindb");
const adminRepository = require("../../features/admin/data/admin-repository");
const challengedb = require("../../features/challenge/data/challengedb");
const shameeventsdb = require("../../features/shame/data/shameeventsdb");
const wrappeddb = require("../../features/wrapped/data/wrappeddb");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`[ReadyDB] ${client.user.tag} ready. Syncing dbs!`);

    console.log(`[ReadyDB] syncing Admin db`);
    await admindb.Admin.sync({ alter: true });
    await adminRepository.initialize();

    console.log(`[ReadyDB] syncing Challenge db`);
    await challengedb.Challenges.sync();

    console.log(`[ReadyDB] syncing ShameEvents db`);
    await shameeventsdb.ShameEvents.sync();

    console.log(`[ReadyDB] syncing Wrapped db`);
    await wrappeddb.Wrapped.sync();

    console.log("[ReadyDB] dbs Synced!");
  },
};
