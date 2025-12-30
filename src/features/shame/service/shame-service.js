const adminRepository = require("../../admin/data/admin-repository");
const shameEventsRepository = require("../data/shame-events-repository");
const {
  eventService,
  USER_EVENT_TYPES,
} = require("../../../core/services/event-service");
const {
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventEntityType,
} = require("discord.js");

const _weekExtra = 7 * 24 * 60 * 60 * 1000;

const shameService = {
  /**
   * Returns true if the user was successfully shamed, false if otherwise
   */
  async shameUser(user, guild) {
    console.log(`[ShameService] attempting to shame user ${user.id}`);

    const shameRoleId = await adminRepository.shamedRoleId.get();
    if (adminRepository.shamedRoleId.isDefault(shameRoleId)) {
      console.log(`[ShameService] no role configured for shaming`);
      return false;
    }

    const role = await guild.roles.fetch(shameRoleId);
    const member = await guild.members.fetch(user.id);
    await member.roles.add(role);

    await this._trackUserMissedChallenge(user);
    await this._trackUserShamed(user, member.roles, shameRoleId);

    await this._handleShameEvent(user, guild);

    console.log(`[ShameService] ${user.id} successfully shamed`);
    return true;
  },

  /**
   * Returns true if the user was successfully unshamed, false if otherwise
   */
  async unshameUser(user, guild) {
    // Consider if we should remove the event if it currently exists to make sure its tidied up
    console.log(`[ShameService] attempting to unshame user ${user.id}`);

    const shameRoleId = await adminRepository.shamedRoleId.get();
    if (adminRepository.shamedRoleId.isDefault(shameRoleId)) {
      console.log(`[ShameService] no role configured for shaming`);
      return false;
    }

    const role = await guild.roles.fetch(shameRoleId);
    const member = await guild.members.fetch(user.id);
    await member.roles.remove(role);

    console.log(`[ShameService] ${user.id} successfully unshamed`);
    return true;
  },

  async _trackUserMissedChallenge(user) {
    await eventService.incrementUserEventCount(
      user.id,
      USER_EVENT_TYPES.USER_MISSED_CHALLENGES,
    );
  },

  async _trackUserShamed(user, memberRoles, shameRoleId) {
    const isNewlyShamed = !memberRoles.cache.some(
      (roleCache) => roleCache.id === shameRoleId,
    );

    if (isNewlyShamed) {
      await eventService.incrementUserEventCount(
        user.id,
        USER_EVENT_TYPES.USER_SHAMED_COUNT,
      );
    }
  },

  async _handleShameEvent(user, guild) {
    const previousEventTable = await shameEventsRepository.findByUserId(
      user.id,
    );
    if (previousEventTable) {
      await this._updateShameEvent(guild, previousEventTable);
    } else {
      await this._createShameEvent(user, guild);
    }
  },

  async _updateShameEvent(guild, previousEventTable) {
    try {
      const previousEvent = await guild.scheduledEvents.fetch({
        guildScheduledEvent: previousEventTable.eventid,
      });
      if (previousEvent) {
        console.log("[ShameService] previous event found, updating dates");

        const previousStart = new Date(previousEvent.scheduledStartAt);
        const previousEnd = new Date(previousEvent.scheduledEndAt);
        const newStartDate = new Date(previousStart.getTime() + _weekExtra);
        const newEndDate = new Date(previousEnd.getTime() + _weekExtra + 1000);

        console.log(
          `[ShameService] previousStart - ${previousStart}
          newStartDate - ${newStartDate}
          previousEnd ${previousEnd}
          newEndDate - ${newEndDate}`,
        );

        await previousEvent.edit({
          scheduledStartTime: newStartDate,
          scheduledEndTime: newEndDate,
        });
      }
    } catch (exception) {
      console.log(
        `[ShameService] exception occurred updating: ${exception}\nRemoving the current stored value and creating new`,
      );
      await shameEventsRepository.destroy(previousEventTable.id);
    }
  },

  async _createShameEvent(user, guild) {
    console.log("[ShameService] no previous event, creating new one");

    const startDate = new Date(Date.now() + _weekExtra);
    const endDate = new Date(Date.now() + _weekExtra + 1000);
    const newEvent = await guild.scheduledEvents.create({
      name: `${user.displayName}s period of shame ends`,
      scheduledStartTime: startDate,
      scheduledEndTime: endDate,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      description: `Event for when the shame of ${user.displayName} has come to an end.`,
      entityType: GuildScheduledEventEntityType.External,
      entityMetadata: {
        location: "",
      },
      reason: "",
    });
    await shameEventsRepository.create(user.id, newEvent.id);
  },
};

module.exports = shameService;
