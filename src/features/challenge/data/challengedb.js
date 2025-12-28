const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  logging: false,
  storage: path.join(__dirname, "../../../../data/challengedb.sqlite"),
});

const Challenges = sequelize.define("challenges", {
  name: Sequelize.TEXT,
  description: Sequelize.TEXT,
  timeframe: Sequelize.TEXT,
  username: Sequelize.TEXT,
  userid: Sequelize.TEXT,
  cheats: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  allowpause: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = { Challenges };
