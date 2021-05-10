const Discord = require("discord.js");

const sendSingleSauceEmbed = (channel, sauce) => {
    // console.log("sending embed");
    const url = "https://nhentai.net/g/" + sauce.code;

    const embed = new Discord.MessageEmbed()
        .setColor("#3bfa99")
        .setTitle(sauce.code)
        .setURL(url)
        .setDescription(sauce.tags)
        .setFooter(`Showing 1 of ${sauce.total} sauce(s)`);

    channel.send(embed);
};

exports.sendSingleSauceEmbed = sendSingleSauceEmbed;
