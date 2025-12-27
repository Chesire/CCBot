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
    console.log(`${client.user.tag} ready. Syncing DBs!`);

    console.log(`Syncing Admin DB`);
    await admindb.Admin.sync({ alter: true });
    await adminRepository.initialize();

    console.log(`Syncing Challenge DB`);
    await challengedb.Challenges.sync();

    console.log(`Syncing ShameEvents DB`);
    await shameeventsdb.ShameEvents.sync();

    console.log(`Syncing Wrapped DB`);
    await wrappeddb.Wrapped.sync();

    console.log("DBs Synced!");
  },
};
