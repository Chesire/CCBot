const { UserYearEvent, ChannelYearEvent } = require("../data/eventdb");

const eventService = {
  async incrementUserEventCount(userId, eventType, amount = 1) {
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

module.exports = eventService;
