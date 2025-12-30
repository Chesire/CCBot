const { Events } = require("discord.js");
const { GuildScheduledEventStatus } = require("discord-api-types/v10");
const adminRepository = require("../../features/admin/data/admin-repository");
const shameEventsRepository = require("../../features/shame/data/shame-events-repository");
const shamePresentation = require("../../features/shame/presentation/shame-presentation");

function getStatusName(status) {
  const statusNames = {
    [GuildScheduledEventStatus.Scheduled]: "Scheduled",
    [GuildScheduledEventStatus.Active]: "Active",
    [GuildScheduledEventStatus.Completed]: "Completed",
    [GuildScheduledEventStatus.Canceled]: "Canceled",
  };
  return statusNames[status] || `Unknown (${status})`;
}

async function removeShameEvent(shameEvent, newEvent) {
  try {
    const guild = newEvent.guild;
    const member = await guild.members.fetch(shameEvent.userid);
    const shamedRole = await adminRepository.shamedRoleId.get();
    const challengeChannelId = await adminRepository.challengeChannelId.get();
    const challengeChannel = await guild.channels.fetch(challengeChannelId);

    await member.roles.remove(shamedRole);
    console.log(`[EventUpdate] removed shame role from ${shameEvent.userid}`);

    if (challengeChannel) {
      await challengeChannel.send(
        shamePresentation.getUnshamedMessage(shameEvent.userid),
      );
    }

    await shameEventsRepository.destroy(shameEvent.id);
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
      `[EventUpdate] update detected, {oldStatus - ${oldStatus}, newStatus - ${newStatus}}`,
    );

    if (
      oldEvent?.status !== GuildScheduledEventStatus.Completed &&
      newEvent.status === GuildScheduledEventStatus.Completed
    ) {
      console.log(
        "[EventUpdate] event has now completed, finding shame event record",
      );
      const shameEvent = await shameEventsRepository.findByEventId(newEvent.id);

      if (shameEvent) {
        console.log(
          "[EventUpdate] shame event record found, attempting to remove role",
        );
        await removeShameEvent(shameEvent, newEvent);
      } else {
        console.log("[EventUpdate] no shame event record found");
      }
    }
  },
};
