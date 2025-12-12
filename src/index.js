// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token } = require("../config.json");
const { loadCommands } = require("./core/loaders/command-loader");
const { loadEvents } = require("./core/loaders/event-loader");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();

const commands = loadCommands();
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

const events = loadEvents();
for (const event of events) {
  console.log(`Loading event: ${event.name}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);
