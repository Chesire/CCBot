const { UserYearEvent, ChannelYearEvent } = require("../data/eventdb");

const USER_EVENT_TYPES = {
  MESSAGE_CREATED: "message_created",
  TIMES_SHAMED: "times_shamed",
  MISSED_CHALLENGES: "missed_challenges",
  TIMES_LOST: "times_lost",
};

const CHANNEL_EVENT_TYPES = {
  MESSAGES_IN_CHANNEL: "messages_in_channel",
};

const eventService = {
  async incrementUserEventCount(userId, eventType, amount = 1) {
    if (!Object.values(USER_EVENT_TYPES).includes(eventType)) {
      console.error(`[EventService] Invalid event type: ${eventType}`);
      return;
    }

    const year = new Date().getFullYear();
    const [record] = await UserYearEvent.findOrCreate({
      where: { userid: userId, year: year, eventtype: eventType },
      defaults: { count: 0 },
    });
    record.count += amount;
    await record.save();
    return record;
  },

  async incrementChannelEventCount(channelId, eventType, amount = 1) {
    if (!Object.values(CHANNEL_EVENT_TYPES).includes(eventType)) {
      console.error(`[EventService] Invalid event type: ${eventType}`);
      return;
    }

    const year = new Date().getFullYear();
    const [record] = await ChannelYearEvent.findOrCreate({
      where: { channelid: channelId, year: year, eventtype: eventType },
      defaults: { count: 0 },
    });
    record.count += amount;
    await record.save();
    return record;
  },
};

module.exports = { eventService, USER_EVENT_TYPES, CHANNEL_EVENT_TYPES };
