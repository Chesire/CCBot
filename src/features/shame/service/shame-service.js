const adminRepository = require("../../../admin/data/admin-repository");
const shameEventsRepository = require("../shame/data/shame-events-repository");

const shameService = {
  /**
   * Returns true if the user was successfully shamed, false if otherwise
   */
  async shameUser(userId, guild) {
    console.log(`[ShameService] attempting to shame user ${userId}`);

    const shameRoleId = await adminRepository.shamedRoleId.get();
    if (adminRepository.shamedRoleId.isDefault(shameRoleId)) {
      console.log(`[ShameService] no role configured for shaming`);
      return false;
    }

    const role = await guild.roles.fetch(shameRoleId);
    const member = await guild.members.fetch(userId);
    await member.roles.add(role);

    await this._trackUserMissedChallenge(userId);
    await this._trackUserShamed(member, userId);

    await this._handleShameEvent(userId, guild);

    console.log(`[ShameService] ${userId} successfully shamed`);
    return true;
  },

  /**
   * Returns true if the user was successfully unshamed, false if otherwise
   */
  async unshameUser(userId, guild) {
    // Consider if we should remove the event if it currently exists to make sure its tidied up
    console.log(`[ShameService] attempting to unshame user ${userId}`);

    const shameRoleId = await adminRepository.shamedRoleId.get();
    if (adminRepository.shamedRoleId.isDefault(shameRoleId)) {
      console.log(`[ShameService] no role configured for shaming`);
      return false;
    }

    const role = await guild.roles.fetch(shameRoleId);
    const member = await guild.members.fetch(userId);
    await member.roles.remove(role);

    console.log(`[ShameService] ${userId} successfully unshamed`);
    return true;
  },

  async _trackUserMissedChallenge(userId) {
    await eventService.incrementUserEventCount(
      userId,
      USER_EVENT_TYPES.USER_MISSED_CHALLENGES,
    );
  },

  async _trackUserShamed(member, userId) {
    const isNewlyShamed = !member.roles.cache.some(
      (roleCache) => roleCache.id === shamedRoleId,
    );

    if (isNewlyShamed) {
      await eventService.incrementUserEventCount(
        userId,
        USER_EVENT_TYPES.USER_SHAMED_COUNT,
      );
    }
  },

  async _handleShameEvent(userId, guild) {
    const previousEventTable = await shameEventsRepository.findByUserId(userId);
    if (previousEventTable) {
      this._updateShameEvent(guild, previousEventTable);
    } else {
      this._createShameEvent(userId, guild);
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
        const newStartDate = new Date(previousStart.getTime() + weekExtra);
        const newEndDate = new Date(previousEnd.getTime() + weekExtra + 1000);

        console.log(
          `[ShameService] previousStart - ${previousStart}\n
          newStartDate - ${newStartDate}\n
          previousEnd ${previousEnd}\n
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

  async _createShameEvent(userId, guild) {
    console.log("[ShameService] no previous event, creating new one");

    const startDate = new Date(Date.now() + weekExtra);
    const endDate = new Date(Date.now() + weekExtra + 1000);
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
    await shameEventsRepository.create(userId, newEvent.id);
  },
};
