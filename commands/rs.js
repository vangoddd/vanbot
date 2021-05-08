const axios = require('axios');
const Discord = require('discord.js');
const osu = require('ojsama');
const fs = require('fs');
const path = require('path');

module.exports = {
	name: 'rs',
	description: 'Display recent submit of an osu user',
    aliases: ['recentscore', 'recentsubmit'],
    usage: '<osu username>',
	execute(message, args) {
        async function getPlayerId() {
            const osuKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../osuKey.json"), 'utf8'));
            const apiURL = 'https://osu.ppy.sh/api/v2/users/' + args[0];
            const AuthStr = "Bearer "+osuKey.access_token;
            let response = await axios.get(apiURL, { headers: { Authorization: AuthStr } })
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        async function getScore(id) {
            const osuKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../osuKey.json"), 'utf8'));
            const apiURL = 'https://osu.ppy.sh/api/v2/users/' + id + '/scores/recent?limit=1';
            const AuthStr = "Bearer "+osuKey.access_token;
            let response = await axios.get(apiURL, { headers: { Authorization: AuthStr } })
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        async function getMaxPP(mapId) {
            const osuKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../osuKey.json"), 'utf8'));
            const url = 'https://osu.ppy.sh/osu/'+mapId;
            const AuthStr = "Bearer "+osuKey.access_token;
            let response = await axios.get(url, { headers: { Authorization: AuthStr } })
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        //user player
        //score beatmap
        //mapfile .osu file

        getPlayerId().then(playerData => {
            getScore(playerData.id).then(score => {
                //console.log(score.length + typeof score);
                if(score.length < 1){
                    message.channel.send('No recent play for '+playerData.username);
                    return;
                }
                getMaxPP(score[0].beatmap.id).then(mapFile => {
                    const parser = new osu.parser().feed(mapFile);

                    const data = {
                        title: score[0].beatmapset.title, //
                        diff: score[0].beatmap.version, //
                        star: score[0].beatmap.difficulty_rating, //
                        player: score[0].user.username, //
                        submitTime: score[0].created_at, //
                        acc: score[0].accuracy, //
                        mods: score[0].mods, //
                        grade: score[0].rank, //
                        pp: score[0].pp, //
                        combo: score[0].max_combo, //
                        maxCombo: 0, //
                        isFc: score[0].perfect, //
                        thumbnail: 'https://b.ppy.sh/thumb/'.concat(score[0].beatmapset.id).concat('.jpg'),
                    };

                    let modStr = '';
                        for(let i=0; i < data.mods.length; i++){
                            modStr += data.mods[i];
                    }
                    const osuMods = osu.modbits.from_string(modStr);
                    const maxPp = osu.ppv2({map: parser.map, mods:osuMods}).toString().split(" ");

                    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
                    const dateObject = new Date(Date.parse(data.submitTime));
                    const dayString = dateObject.toLocaleDateString("en-US", options);
                    const timeString = ("0" + dateObject.getHours()).slice(-2) + ":" + ("0" + dateObject.getMinutes()).slice(-2);

                    const embed = new Discord.MessageEmbed()
                    .setColor('#aa0000')
                    .setDescription(data.title)
                    .setTitle('Recent Play')
                    //.setImage(score[0].user.avatar_url)
                    .setURL('https://osu.ppy.sh/b/'.concat(score[0].beatmap.id))
                    .setThumbnail(data.thumbnail)
                    .addFields(
                        { name: data.player, value: `
                        ${dayString}
                        ${timeString}`, inline: true },
                        { name: 'Difficulty', value: data.diff+'\n[ '+data.star+' ]'+'\n No Mods', inline: true },
                        { name: 'Score', value: data.grade, inline:true },
                        { name: 'Acc', value: (data.acc*100).toFixed(2)+'%', inline: true },
                        { name: 'pp', value: data.pp + '/' + maxPp[0], inline: true },
                        { name: 'Combo', value: data.combo, inline:true },
                    )
                    .setTimestamp();

                    if(data.mods.length > 0){
                        embed.spliceFields(1, 1, { name: 'Difficulty', value: data.diff+'\n[ '+data.star+' ]' + ' \n' + modStr, inline: true })
                    }
                    if(data.isFc){
                        embed.spliceFields(5, 1, { name: 'Combo', value: data.combo +' Full Combo!', inline:true });
                    }
                    if(data.pp == null){
                        embed.spliceFields(4, 1, { name: 'pp', value: '- /' + maxPp[0], inline: true },);
                    }else{
                        embed.spliceFields(4, 1, { name: 'pp', value: data.pp.toFixed(2) + '/' + maxPp[0], inline: true },);
                    }

                    message.channel.send(embed);

                });
            });
        });
	},
};