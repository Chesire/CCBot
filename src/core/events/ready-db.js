const { Events } = require("discord.js");
const admindb = require("../../features/admin/data/admindb");
const challengedb = require("../../features/challenge/data/challengedb");
const shameeventsdb = require("../../features/shame/data/shameeventsdb");
const wrappeddb = require("../../features/wrapped/data/wrappeddb");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`${client.user.tag} ready. Syncing DBs!`);

    admindb.Admin.sync({ alter: true });
    challengedb.Challenges.sync();
    shameeventsdb.ShameEvents.sync();
    wrappeddb.Wrapped.sync();

    console.log("DBs Synced!");
  },
};
