const admindb = require("./admindb");

const adminRepository = {
  async initialize() {
    const adminRecord = await admindb.Admin.findByPk(0);
    if (!adminRecord) {
      console.log("[AdminRepository] no admin record found, creating default");
      await admindb.Admin.create({ singleid: 0 });
    }
  },

  _createSetting(fieldName) {
    const attributes = admindb.Admin.getAttributes();
    const defaultValue = attributes[fieldName]?.defaultValue;
    return {
      async get() {
        const record = await admindb.Admin.findByPk(0);
        return record?.[fieldName] ?? defaultValue;
      },
      async set(value) {
        const record = await admindb.Admin.findByPk(0);
        await record.update({ [fieldName]: value });
      },
    };
  },

  allowBotShameReplies: this._createSetting("allowbotshamereplies"),
  challengeChannelId: this._createSetting("challengechannelid"),
  shamedRoleId: this._createSetting("shamedroleid"),
};

module.exports = adminRepository;
