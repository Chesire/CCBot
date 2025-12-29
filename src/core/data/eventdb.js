const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  logging: false,
  storage: path.join(__dirname, "../../../data/eventdb.sqlite"),
  pool: { max: 1, min: 0, idle: 20000, acquire: 20000 },
  retry: { max: 3 },
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
        name: "idx_user_year_event",
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
        name: "idx_channel_year_event",
      },
    ],
  },
);

module.exports = { UserYearEvent, ChannelYearEvent };
