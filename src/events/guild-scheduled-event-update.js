const { Events } = require('discord.js');
const { GuildScheduledEventStatus } = require('discord-api-types/v10');
const adminDb = require('../database/admindb');
const shameEventsDb = require('../database/shameeventsdb');

function getStatusName(status) {
  const statusNames = {
    [GuildScheduledEventStatus.Scheduled]: 'Scheduled',
    [GuildScheduledEventStatus.Active]: 'Active',
    [GuildScheduledEventStatus.Completed]: 'Completed',
    [GuildScheduledEventStatus.Canceled]: 'Canceled'
  };
  return statusNames[status] || `Unknown (${status})`;
}

async function removeShameRecord(shameRecord, newEvent) {
  try {
    const guild = newEvent.guild;
    const member = await guild.members.fetch(shameRecord.userid);
    const db = await adminDb.Admin.findOne({ where: { singleid: 0 } });

    if (db && db.shamedroleid) {
      await member.roles.remove(db.shamedroleid);
      console.log(`Removed shame role from ${shameRecord.userid}`);

      if (db.challengechannelid) {
        const channel = await guild.channels.fetch(db.challengechannelid);
        if (channel) {
          await channel.send(`<@${shameRecord.userid}>, your shame period has ended. You are free!`);
        }
      }
    }

    await shameEventsDb.ShameEvents.destroy({
      where: { eventid: newEvent.id }
    });
  } catch (error) {
    console.error(`Error removing shame role: ${error}`);
  }
}

module.exports = {
  name: Events.GuildScheduledEventUpdate,
  async execute(oldEvent, newEvent) {
    const oldStatus = getStatusName(oldEvent?.status);
    const newStatus = getStatusName(newEvent.status);
    console.log(`GuildScheduledEventUpdate detected, {old status - ${oldStatus}, newStatus - ${newStatus}}`);
    if (oldEvent?.status !== GuildScheduledEventStatus.Completed && newEvent.status === GuildScheduledEventStatus.Completed) {
      console.log('Event is completed state, finding shamed user');
      const shameRecord = await shameEventsDb.ShameEvents.findOne({ where: { eventid: newEvent.id } });

      if (shameRecord) {
        console.log('Shame record found, attempting to remove role');
        await removeShameRecord(shameRecord, newEvent);
      }
    }
  }
};
