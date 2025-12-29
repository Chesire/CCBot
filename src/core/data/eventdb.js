const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  logging: false,
  storage: path.join(__dirname, "../../../../data/eventdb.sqlite"),
});

const UserYearEvent = sequelize.define(
  "useryearevent",
  {
    userid: Sequelize.TEXT,
    year: Sequelize.INTEGER,
    eventtype: Sequelize.TEXT,
    count: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        fields: ["userid", "year", "eventtype"],
        unique: true,
      },
    ],
  },
);

const ChannelYearEvent = sequelize.define(
  "channelyearevent",
  {
    channelid: Sequelize.TEXT,
    year: Sequelize.INTEGER,
    eventtype: Sequelize.TEXT,
    count: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        fields: ["channelid", "year", "eventtype"],
        unique: true,
      },
    ],
  },
);

module.exports = { UserYearEvent, ChannelYearEvent };
