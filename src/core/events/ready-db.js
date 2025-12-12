const { Events } = require("discord.js");
const admindb = require("../../database/admindb");
const challengedb = require("../../features/challenge/data/challengedb");
const shameeventsdb = require("../../database/shameeventsdb");
const wrappeddb = require("../../database/wrappeddb");

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
