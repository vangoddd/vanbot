const axios = require("axios");
const config = require("../config.json");
const Discord = require("discord.js");

module.exports = {
  name: "bm",
  description: "Search for osu beatmap",
  aliases: ["beatmap"],
  usage: "<beatmap ID>",
  execute(message, args) {
    const apiURL = "https://osu.ppy.sh/api/v2/beatmaps/" + args[0];
    const AuthStr = config.osuAuthStr;
    axios
      .get(apiURL, { headers: { Authorization: AuthStr } })
      .then((response) => {
        const apiData = {
          title: response.data.beatmapset.title,
          beatmapSetId: response.data.beatmapset.id,
          star: response.data.difficulty_rating,
          diff: response.data.version,
          author: response.data.beatmapset.creator,
          artist: response.data.beatmapset.artist,
          url: response.data.url,
        };
        const thumbnail = "https://b.ppy.sh/thumb/"
          .concat(apiData.beatmapSetId)
          .concat(".jpg");

        const embed = new Discord.MessageEmbed()
          .setColor("#aa0000")
          .setDescription(apiData.artist)
          .setTitle(apiData.title)
          .setURL(apiData.url)
          .setThumbnail(thumbnail)
          .addField(
            "Info",
            "Difficulty : "
              .concat(apiData.diff)
              .concat(
                " ["
                  .concat(apiData.star)
                  .concat("]")
                  .concat("\nMapper : ")
                  .concat(apiData.author)
              ),
            true
          )
          .setTimestamp();

        message.channel.send(embed);
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
