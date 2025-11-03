const { Events } = require('discord.js');
const admindb = require('../database/admindb');
const challengedb = require('../database/challengedb');
const shameeventsdb = require('../database/shameeventsdb');
const wrappeddb = require('../database/wrappeddb');
const { migrateUserIds } = require('../database/migrations/fix-userid-precision');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} ready. Syncing DBs!`);

    admindb.Admin.sync({ alter: true });
    challengedb.Challenges.sync();
    shameeventsdb.ShameEvents.sync();
    wrappeddb.Wrapped.sync();

    console.log('DBs Synced!');

    // Run migration to fix userid precision (pass client for guild member fetching)
    await migrateUserIds(client);
  }
};
