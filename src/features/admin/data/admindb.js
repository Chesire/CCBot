const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  logging: false,
  storage: path.join(__dirname, "../../../../data/admindb.sqlite"),
});

const Admin = sequelize.define("admin", {
  singleid: {
    type: Sequelize.NUMBER,
    defaultValue: 0,
    primaryKey: true,
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

module.exports = { Admin };
