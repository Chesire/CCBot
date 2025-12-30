const shameeventsdb = require("./shameeventsdb");

const shameEventsRepository = {
  async create(userId, eventId) {
    return await shameeventsdb.ShameEvents.create({
      userid: userId,
      eventid: eventId,
    });
  },

  async findByUserId(userId) {
    return await shameeventsdb.ShameEvents.findOne({
      where: { userid: userId },
    });
  },

  async findByEventId(eventId) {
    return await shameeventsdb.ShameEvents.findOne({
      where: { eventid: eventId },
    });
  },

  async destroy(id) {
    return await shameeventsdb.ShameEvents.destroy({
      where: { id: id },
    });
  },
};

module.exports = shameEventsRepository;
