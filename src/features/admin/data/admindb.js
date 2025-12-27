const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize("admindb", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  // SQLite only
  storage: path.join(__dirname, "../../../../data/admindb.sqlite"),
});

const Admin = sequelize.define("admin", {
  singleid: {
    type: Sequelize.NUMBER,
    defaultValue: 0,
  },
  challengechannelid: {
    type: Sequelize.TEXT,
    defaultValue: "0",
  },
  shamedroleid: {
    type: Sequelize.TEXT,
    defaultValue: "0",
  },
  allowbotshamereplies: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

async function initializeAdminDb() {
  const adminRecord = await Admin.findByPk(0);
  if (!adminRecord) {
    await Admin.create({
      singleid: 0,
      challengechannelid: "0",
      shamedroleid: "0",
      allowbotshamereplies: true,
    });
  }
}

module.exports = { Admin, initializeAdminDb };
