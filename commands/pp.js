const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "pp",
  description: "Display pp of an osu user",
  usage: "<osu username>",
  execute(message, args) {
    const osuKey = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../osuKey.json"), "utf8")
    );
    const apiURL = "https://osu.ppy.sh/api/v2/users/" + args[0];
    const AuthStr = "Bearer " + osuKey.access_token;
    axios
      .get(apiURL, { headers: { Authorization: AuthStr } })
      .then((response) => {
        // console.log(response);
        message.channel.send(
          `This osu user's pp is: ${response.data.statistics.pp}`
        );
      })
      .catch((error) => {
        console.log("error");
      });
  },
};
