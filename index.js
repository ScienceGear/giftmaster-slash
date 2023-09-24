const Discord = require("discord.js");
const { Client, Intents, Permissions, Collection } = require("discord.js");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");
const config = require('./config.json');
const fs = require("fs");
const generated = new Set();
const server = require('./server.js');
const commands = require('./deploy-commands.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${config.status}`, { type: "WATCHING" }); // Set the bot's activity status
    /* You can change the activity type to:
     * LISTENING
     * WATCHING
     * COMPETING
     * STREAMING (you need to add a twitch.tv url next to type like this:   { type: "STREAMING", url: "https://twitch.tv/twitch_username_here"} )
     * PLAYING (default)
    */
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.token || token);

