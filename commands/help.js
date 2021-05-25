const { prefix } = require("../config.json");

module.exports = {
  name: "help",
  description: "Display command help information",
  aliases: [],
  usage: "<command name>\n!help",
  execute(message, args) {
    const data = [];
    const { commands } = message.client;
    if (!args.length) {
      message.channel.send(
        "```Heres the list of my commands\n\n" +
          `${commands.map((command) => command.name).join(", ")}` +
          "\n !help <command name>```"
      );
    } else {
      const name = args[0].toLowerCase();
      const command =
        commands.get(name) ||
        commands.find((c) => c.aliases && c.aliases.includes(name));

      if (!command) {
        return message.reply("that's not a valid command!");
      }

      data.push(`**Name:** ${command.name}`);

      if (command.aliases)
        data.push(`**Aliases:** ${command.aliases.join(", ")}`);
      if (command.description)
        data.push(`**Description:** ${command.description}`);
      if (command.usage)
        data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

      message.channel.send(data, { split: true });
    }
  },
};
