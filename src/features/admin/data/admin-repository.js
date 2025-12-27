const { Sequelize } = require("sequelize");
const admindb = require("./admindb");

const adminRepository = {
  async initialize() {
    this._record = await admindb.Admin.findByPk(0);
    if (!this._record) {
      console.log("[AdminRepository] no admin record found, creating default");
      this._record = await admindb.Admin.create({ singleid: 0 });
    }
  },

  _createSetting(fieldName) {
    const attributes = admindb.Admin.getAttributes();
    const fieldType = attributes[fieldName]?.type;
    const defaultValue = attributes[fieldName]?.defaultValue;
    const self = this;

    const coerce = (value) => {
      // For now only Boolean and String types are used
      if (fieldType instanceof admindb.Sequelize.BOOLEAN) {
        return Boolean(value);
      }
      return String(value);
    };

    return {
      async get() {
        return self._record?.[fieldName] ?? defaultValue;
      },
      async set(value) {
        if (!self._record) {
          self._record = await admindb.Admin.findByPk(0);
        }
        await self._record.update({ [fieldName]: coerce(value) });
      },
      isDefault(value) {
        return coerce(value).toString() === defaultValue.toString();
      },
    };
  },

  allowBotShameReplies: this._createSetting("allowbotshamereplies"),
  challengeChannelId: this._createSetting("challengechannelid"),
  shamedRoleId: this._createSetting("shamedroleid"),
};

module.exports = adminRepository;
