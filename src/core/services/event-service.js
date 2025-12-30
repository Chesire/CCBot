const { UserYearEvent, ChannelYearEvent } = require("../data/eventdb");

const USER_EVENT_TYPES = {
  USER_MESSAGE_COUNT: "user_message_count",
  USER_SHAMED_COUNT: "user_shamed_count",
  USER_MISSED_CHALLENGES: "user_missed_challenges",
  USER_TIMES_LOST: "user_times_lost",
};

const CHANNEL_EVENT_TYPES = {
  CHANNEL_MESSAGE_COUNT: "channel_message_count",
};

const VALID_USER_EVENT_TYPES = new Set(Object.values(USER_EVENT_TYPES));
const VALID_CHANNEL_EVENT_TYPES = new Set(Object.values(CHANNEL_EVENT_TYPES));

const eventService = {
  async incrementUserEventCount(userId, eventType, amount = 1) {
    if (!VALID_USER_EVENT_TYPES.has(eventType)) {
      console.error(`[EventService] Invalid event type: ${eventType}`);
      return;
    }

    const year = new Date().getFullYear();
    const [record] = await UserYearEvent.findOrCreate({
      where: { userid: userId, year: year, eventtype: eventType },
      defaults: { count: 0 },
    });
    await record.increment("count", { by: amount });
    return record;
  },

  async incrementChannelEventCount(channelId, eventType, amount = 1) {
    if (!VALID_CHANNEL_EVENT_TYPES.has(eventType)) {
      console.error(`[EventService] Invalid event type: ${eventType}`);
      return;
    }

    const year = new Date().getFullYear();
    const [record] = await ChannelYearEvent.findOrCreate({
      where: { channelid: channelId, year: year, eventtype: eventType },
      defaults: { count: 0 },
    });
    await record.increment("count", { by: amount });
    return record;
  },
};

module.exports = { eventService, USER_EVENT_TYPES, CHANNEL_EVENT_TYPES };
