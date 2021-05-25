const Discord = require("discord.js");

const PAGE_ITEM = 10;

const codeBlock = (msg, header) => {
  return (output = "```\n" + header + "\n" + msg + "``` ");
};

//return a page (String)
const getPage = (page, msg) => {
  return msg.slice((page - 1) * PAGE_ITEM, page * PAGE_ITEM).join("\n");
};

//takes message, header, page
//returns a new message
const navigatePages = (msg, header, page, maxPage) => {
  let newPage;
  if (reaction.emoji.name === "⬅️") {
    pos--;
  } else if (reaction.emoji.name === "➡️") {
    pos++;
  }
  if (pos < 0) {
    pos = charImage.length - 1;
  } else if (pos >= charImage.length) {
    pos = 0;
  }

  const newMessage = "";

  return { newMessage, newPage };
};

// msg is an array of sauces, Header is a string
const paginateMsg = (discord_message, msg, header) => {
  let clientInstance = discord_message.client;

  // determine how many pages there is
  let maxPage = Math.ceil(msg.length / PAGE_ITEM);
  let page = 1;
  let pageItem = getPage(page, msg);

  discord_message.channel.send(codeBlock(pageItem, header)).then((m) => {
    m.react("⬅️").then(() => {
      m.react("➡️");
      const filter = (reaction, user) => {
        return (
          (reaction.emoji.name === "⬅️" || reaction.emoji.name === "➡️") &&
          !user.bot
        );
      };
      const collector = m.createReactionCollector(filter, { time: 120000 });

      collector.on("collect", (reaction, user) => {
        // codeBlock(navigatePages(m.message, header, page, maxPage))
        m.edit("clicked");
      });

      clientInstance.on("messageReactionRemove", (messageReaction) => {
        if (messageReaction.message == m) {
          m.edit("unclicked");
        }
      });
    });
  });
};

const sendPaginatedEmbed = (discord_message, sauces, tagged) => {
  const msg = [];

  let header = "";
  if (tagged) {
    header = `Found ${sauces.length} of ${sauces[0].count} Sauces tagged with "${sauces[0].tags}"\n`;
  } else {
    header = `Found ${sauces.length} of ${sauces[0].count} Sauces\n`;
  }

  for (let i = 0; i < sauces.length; i++) {
    msg.push(sauces[i].code);
  }

  // Add a pagination logic
  paginateMsg(discord_message, msg, header);
};

const sendSingleSauceEmbed = (channel, sauce, tagged) => {
  // console.log("sending embed");
  const url = "https://nhentai.net/g/" + sauce.code;

  const embed = new Discord.MessageEmbed()
    .setColor("#3bfa99")
    .setTitle(sauce.code)
    .setURL(url)
    .setDescription(sauce.tags);
  if (tagged) {
    embed.setFooter(
      `Found 1 of ${sauce.count} sauce(s) tagged with ${sauce.tags}`
    );
  } else {
    embed.setFooter(`Found 1 of ${sauce.total} sauce(s)`);
  }

  channel.send(embed);
};

exports.sendSingleSauceEmbed = sendSingleSauceEmbed;
exports.sendPaginatedEmbed = sendPaginatedEmbed;
