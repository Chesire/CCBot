const { Sequelize } = require('sequelize');
const path = require('path');

/**
 * ShameEventsDB - Tracks Discord Scheduled Events created when users are shamed
 *
 * This database stores the mapping between Discord users and Discord Scheduled Events.
 * When a user is shamed via /shame add, a Discord Scheduled Event is created to mark
 * when their shame period ends (7 days from the shame date).
 *
 * Fields:
 * - userid: Discord user ID of the shamed user
 * - eventid: Discord Scheduled Event ID (the event created in the guild)
 *
 * Usage:
 * - When shaming a user, a new Discord Scheduled Event is created and its ID is stored
 * - If the user is shamed again, the previous event is updated (extended by 7 days)
 * - If the previous event no longer exists in Discord, it's deleted from DB and a new one is created
 *
 * Design: Should contain at most ONE record per userid, but this is NOT enforced by database constraints
 * The shame.js command enforces this in application logic by finding and destroying old records before creating new ones
 * TODO: Add UNIQUE constraint on userid to the table schema
 *
 * Note: This tracks WHEN users were shamed (via scheduled events), not WHAT types of shame events occurred
 */
const sequelize = new Sequelize('shameeventsdb', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: path.join(__dirname, '../../data/shameeventsdb.sqlite'),
});

const ShameEvents = sequelize.define('shameevents', {
  userid: Sequelize.TEXT,
  eventid: Sequelize.TEXT
});

module.exports = { ShameEvents };
