const Discord = require("discord.js");
const config = require("./config.json");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  let now = Date.now();

  let osuKeyData;
  let lastRefresh;

  try {
    osuKeyData = JSON.parse(fs.readFileSync("./osuKey.json", "utf8"));
  } catch (err) {
    osuKeyData = "";
  }

  try {
    lastRefresh = fs.readFileSync("./lastRefresh.txt", "utf8");
  } catch (err) {
    lastRefresh = "";
  }

  //send post request to https://osu.ppy.sh/oauth/token
  if (!lastRefresh || Date.now() - lastRefresh > 43200000) {
    axios
      .post("https://osu.ppy.sh/oauth/token", {
        client_id: process.env.OSU_CLIENT_ID,
        client_secret: process.env.OSU_CLIENT_SECRET,
        refresh_token:
          osuKeyData.refresh_token || process.env.OSU_REFRESH_TOKEN,
        grant_type: "refresh_token",
        redirect_uri: "https://google.com",
      })
      .then((res) => {
        //console.log(`statusCode: ${res.statusCode}`);
        fs.writeFileSync(
          "./osuKey.json",
          JSON.stringify(res.data, null, 2),
          "utf8"
        );
        fs.writeFileSync("./lastRefresh.txt", now.toString());
        console.log("token renewed");
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    console.log(
      "token not renewed, last renewed " + new Date(Number(lastRefresh))
    );
  }

  client.user
    .setPresence({ activity: { name: "!help" }, status: "idle" })
    .then(console.log("Status set"))
    .catch(console.error);

  console.log("Ready!");
});

client.on("message", (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(" ");
  let commandName = args.shift().toLowerCase();
  console.log("Command : " + commandName);

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  try {
    if (!client.commands.get(commandName)) {
      commandName = client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      ).name;
      console.log("command name changed to " + commandName);
    }
    client.commands.get(commandName).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

client.login(process.env.DISCORD_TOKEN);
