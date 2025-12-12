// TODO: Create remote data source for API
// TODO: Create local data source for DB (?)
// add a migrate command to move data from the current DB to the remote one
// add an option to use local DB vs remote DB (if not configured, use local DB by default)
const challengedb = require("./challengedb");

const challengeRepository = {
  async create(challengeData) {
    return await challengedb.Challenges.create(challengeData);
  },

  async findAllByUserId(userId) {
    return await challengedb.Challenges.findAll({
      where: { userid: userId },
    });
  },

  async findById(id) {
    return await challengedb.Challenges.findOne({
      where: { id: id },
    });
  },

  async destroy(id) {
    return await challengedb.Challenges.destroy({
      where: { id: id },
    });
  },
};

module.exports = challengeRepository;
