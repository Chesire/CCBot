const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  logging: false,
  storage: path.join(__dirname, "../../../../data/wrappeddb.sqlite"),
});

const Wrapped = sequelize.define("wrapped", {
  userid: Sequelize.TEXT,
  messagecount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  shamedcount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  missedchallenges: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  timeslost: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = { Wrapped };
