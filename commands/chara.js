const axios = require('axios');
const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'chara',
	description: 'Search for a character (animanga)',
    aliases: ['c'],
    usage: '<character name>',
	execute(message, args) {

        let pos = 0;
        let charImage = [];
        let clientInstance = message.client;

        async function getSearch() {
            let searchUrl = 'https://api.jikan.moe/v3/search/character?q=';
            for(let i = 0; i < args.length; i++){
                searchUrl += args[i] +' ';
            }
            console.log(searchUrl);
            let response = await axios.get(searchUrl)
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        async function getChara(id) {
            let charaUrl = 'https://api.jikan.moe/v3/character/' + id;
            let response = await axios.get(charaUrl)
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        async function getCharImage(id){
            let charaUrl = 'https://api.jikan.moe/v3/character/' + id +'/pictures';
            let response = await axios.get(charaUrl)
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        function navigateEmbed(reaction, embed, length){
            if(reaction.emoji.name === '⬅️'){
                pos--;
            }else if(reaction.emoji.name === '➡️'){
                pos++;
            }
            if(pos < 0){
                pos = charImage.length-1;
            }else if(pos >= charImage.length){
                pos = 0;
            }
            const newEmbed = embed;
            newEmbed.setImage(charImage[pos])
            .setFooter(`${pos + 1} / ${length}`);

            return newEmbed;
        }
        
        getSearch().then(id => {
            getChara(id.results[0].mal_id).then(chara => {
                getCharImage(chara.mal_id).then(imgList => {
                    charImage.push(chara.image_url);
                    for(let i = 0; i < imgList.pictures.length; i++){
                        charImage.push(imgList.pictures[i].large);
                    }

                    let voiceActor = null;
                    for(let i = 0; i < chara.voice_actors.length; i++){
                        if(chara.voice_actors[i].language == 'Japanese') {
                            voiceActor = chara.voice_actors[i].name;
                            break;
                        }
                    }

                    const embed = new Discord.MessageEmbed()
                    .setColor('#aa0000')
                    .setDescription(voiceActor)
                    .setTitle(chara.name)
                    .setURL(chara.url)
                    .setFooter(`${pos + 1} / ${charImage.length}`)
                    .setTimestamp()
                    .setImage(charImage[pos]);

                    let nickStr ="";
                    if(chara.nicknames.length>0){
                        for(let i = 0; i < chara.nicknames.length; i++){
                            if(i != chara.nicknames.length - 1) {
                                nickStr += chara.nicknames[i] + ', ';
                            }else{
                                nickStr += chara.nicknames[i];
                            }
                        }
                        embed.addFields( {name: 'Nicknames', value: nickStr});
                    }

                    if(chara.animeography.length > 0){
                        embed.setDescription(`[${chara.animeography[0].name}](${chara.animeography[0].url})` + '\n' + voiceActor );
                    }else if(chara.mangaography.length > 0){
                        embed.setDescription(`[${chara.mangaography[0].name}](${chara.mangaography[0].url})` + '\n' + voiceActor );
                    }

                    message.channel.send(embed).then(m => {
                        m.react('⬅️').then(() => {
                            m.react('➡️');
                            const filter = (reaction, user) => {
                                return (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && !user.bot;
                            };
                            const collector = m.createReactionCollector(filter, { time: 120000 });
            
                            collector.on('collect', (reaction, user) => {
                                m.edit(navigateEmbed(reaction, m.embeds[0], charImage.length));
                            });

                            clientInstance.on('messageReactionRemove', (messageReaction) => {
                                if(messageReaction.message == m){
                                    m.edit(navigateEmbed(messageReaction, m.embeds[0], charImage.length));
                                }
                            })

                        });
                        
                    });;
                })
            })
        })
        
	},
};