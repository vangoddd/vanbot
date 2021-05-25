const axios = require("axios");
const sendEmbed = require("../helper/sendembed");

module.exports = {
  name: "hotsauce",
  description: "Get you the sauce",
  aliases: ["hs"],
  usage: `
  !hotsauce
  !hotsauce all
  !hotsauce <number of sauce>
  !hotsauce taglist
  !hotsauce <tag>
  !hotsauce <tag> <number of sauce>
  !hotsauce add <code> <tag>`,
  execute(message, args) {
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    const send = (msg) => {
      message.channel.send(msg);
    };

    const addSpace = (amt) => {
      let spaces = "";
      for (let i = 0; i < amt; i++) {
        spaces += " ";
      }
      return spaces;
    };

    function isNumeric(str) {
      if (typeof str != "string") return false;
      return !isNaN(str) && !isNaN(parseFloat(str));
    }

    const checkSauce = (sauceInput) => {
      if (
        sauceInput.match(/^[0-9]+$/) &&
        sauceInput.length > 4 &&
        sauceInput.length < 7
      ) {
        return true;
      }
      return false;
    };

    const client = message.client;

    const api = "https://pacific-mountain-45451.herokuapp.com";
    //const api = "http://localhost:3000";

    // !hotsauce
    if (!args.length) {
      axios
        .get(api + "/api/random")
        .then((response) => {
          sendEmbed.sendSingleSauceEmbed(
            message.channel,
            response.data[0],
            false
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // if there is an argument
    else {
      // *************************************
      // !hotsauce add
      if (args.length == 1 && args[0] === "add") {
        send(
          "!hotsauce add <code> <tag>\nOr submit your sauce at \nhttps://pacific-mountain-45451.herokuapp.com/ \n<3"
        );
      }
      // *************************************
      // !hotsauce add <code> <tag>
      else if (args.length >= 3 && args[0] === "add") {
        let sauce;
        let tag = args
          .map((key) => {
            return key.toLowerCase();
          })
          .slice(2)
          .join(" ");

        //check sauce
        if (checkSauce(args[1])) {
          sauce = args[1];
        } else {
          send("Please enter a valid code");
          return;
        }

        let packet = { code: sauce, tags: tag };

        console.log(packet);

        //send post to api
        axios
          .post(api + "/api/add", packet)
          .then((response) => {
            send("Sauce added to db. Thanks for your contribution <3");
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // *************************************
      // !hotsauce taglist
      else if (args[0] === "taglist") {
        axios
          .get(api + "/api/taglist")
          .then((response) => {
            //response.data
            let maxLength = 0;

            for (let i = 0; i < response.data.length; i++) {
              if (response.data[i].tags.length > maxLength) {
                maxLength = response.data[i].tags.length;
              }
            }

            let msg = ["Tag Name\tNumber of sauce(s)\n"];
            for (let i = 0; i < response.data.length; i++) {
              msg.push(
                response.data[i].tags +
                  addSpace(maxLength - response.data[i].tags.length) +
                  "\t" +
                  response.data[i].count
              );
            }

            send(`\`\`\` ${msg.join("\n")}\`\`\``);
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // *************************************
      // !hotsauce <tag>
      else if (
        args[0] !== "add" &&
        !isNumeric(args[0]) &&
        !isNumeric(args[args.length - 1])
      ) {
        console.log("!hotsauce <tag>");
        let tag = args
          .map((key) => {
            return key.toLowerCase();
          })
          .join(" ");

        axios
          .get(api + "/api/random/" + tag)
          .then((response) => {
            if (!response.data.length) {
              send("No sauces found");
              return;
            }
            sendEmbed.sendSingleSauceEmbed(
              message.channel,
              response.data[0],
              true
            );
            // send(
            //     `\`\`\` ${response.data[0].code}\nShowing 1 of ${response.data[0].count} sauce(s) tagged with ${response.data[0].tags}\`\`\``
            // );
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // *************************************
      // !hotsauce <number>
      else if (args.length == 1 && isNumeric(args[0])) {
        axios
          .get(api + "/api/random?amt=" + args[0])
          .then((response) => {
            if (!response.data.length) {
              send("No sauces found");
              return;
            }
            const msg = [];
            for (let i = 0; i < response.data.length; i++) {
              msg.push(
                response.data[i].code +
                  addSpace(6 - response.data[i].code.length) +
                  "\t" +
                  response.data[i].tags
              );
            }
            msg.push(
              `\nShowing ${response.data.length} of ${response.data[0].total} Sauces`
            );
            send(`\`\`\`\n${msg.join("\n")}\`\`\``);
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // *************************************
      // !hotsauce <tag> <number>
      else if (
        args[0] !== "add" &&
        !isNumeric(args[0]) &&
        isNumeric(args[args.length - 1])
      ) {
        let tag = args
          .map((key) => {
            return key.toLowerCase();
          })
          .slice(0, args.length - 1)
          .join(" ");
        console.log("tag : " + tag);

        axios
          .get(api + "/api/random/" + tag + "?amt=" + args[args.length - 1])
          .then((response) => {
            if (!response.data.length) {
              send("No sauces found");
              return;
            }
            sendEmbed.sendPaginatedEmbed(message, response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  },
};
