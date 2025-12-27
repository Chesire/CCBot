const { Events } = require("discord.js");
const { GuildScheduledEventStatus } = require("discord-api-types/v10");
const adminRepository = require("../../features/admin/data/admin-repository");
const shameEventsDb = require("../../features/shame/data/shameeventsdb");

function getStatusName(status) {
  const statusNames = {
    [GuildScheduledEventStatus.Scheduled]: "Scheduled",
    [GuildScheduledEventStatus.Active]: "Active",
    [GuildScheduledEventStatus.Completed]: "Completed",
    [GuildScheduledEventStatus.Canceled]: "Canceled",
  };
  return statusNames[status] || `Unknown (${status})`;
}

async function removeShameRecord(shameRecord, newEvent) {
  try {
    const guild = newEvent.guild;
    const member = await guild.members.fetch(shameRecord.userid);
    const shamedRole = await adminRepository.shamedRoleId.get();
    const challengeChannelId = await adminRepository.challengeChannelId.get();
    const challengeChannel = await guild.channels.fetch(challengeChannelId);

    await member.roles.remove(shamedRole);
    console.log(`[EventUpdate] removed shame role from ${shameRecord.userid}`);

    if (challengeChannel) {
      await challengeChannel.send(
        `<@${shameRecord.userid}>, your shame period has ended. You are free!`,
      );
    }

    await shameEventsDb.ShameEvents.destroy({
      where: { eventid: newEvent.id },
    });
  } catch (error) {
    console.error(`[EventUpdate] error removing shame role: ${error}`);
  }
}

module.exports = {
  name: Events.GuildScheduledEventUpdate,
  async execute(oldEvent, newEvent) {
    const oldStatus = getStatusName(oldEvent?.status);
    const newStatus = getStatusName(newEvent.status);
    console.log(
      `[EventUpdate] update detected, {old status - ${oldStatus}, newStatus - ${newStatus}}`,
    );

    if (
      oldEvent?.status !== GuildScheduledEventStatus.Completed &&
      newEvent.status === GuildScheduledEventStatus.Completed
    ) {
      console.log(
        "[EventUpdate] event is completed state, finding shamed user",
      );
      const shameRecord = await shameEventsDb.ShameEvents.findOne({
        where: { eventid: newEvent.id },
      });

      if (shameRecord) {
        console.log(
          "[EventUpdate] shame record found, attempting to remove role",
        );
        await removeShameRecord(shameRecord, newEvent);
      }
    }
  },
};
