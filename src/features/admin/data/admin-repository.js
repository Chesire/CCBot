const admindb = require("./admindb");

const adminRepository = {
  async initialize() {
    const adminRecord = await admindb.Admin.findByPk(0);
    if (!adminRecord) {
      await admindb.Admin.create({ singleid: 0 });
    }
  },

  async get(key) {
    const adminRecord = await admindb.Admin.findByPk(0);
    return adminRecord ? adminRecord[key] : null;
  },

  async set(key, value) {
    const adminRecord = await admindb.Admin.findByPk(0);
    await adminRecord.update({ [key]: value });
  },
};

module.exports = adminRepository;
