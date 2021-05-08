const axios = require('axios');
const config = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'anisearch',
	description: 'Search anime and display basic information',
    aliases: ['as'],
    usage: '<anime name>',
	execute(message, args) {
        let fullSynopsis = null;

        async function getSearch() {
            let apiURL = 'https://api.jikan.moe/v3/search/anime?q=';
            for(let i = 0; i < args.length; i++){
                apiURL += args[i] +' ';
            }
            //console.log(apiURL);
            let response = await axios.get(apiURL)
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        async function getAnime(malId) {
            let apiURL = 'https://api.jikan.moe/v3/anime/' + malId;
            //console.log(apiURL);
            let response = await axios.get(apiURL)
            .catch((error) => {
                console.log(error);
            });
            return response.data;
        }

        getSearch().then(response => {
            let result = response.results;
            if(result.length == 0){
                message.channel.send('not found');
                return;
            }
            result = response.results[0];
            getAnime(result.mal_id).then(anime => {

                const data = {
                    title: anime.title,
                    enTitle: anime.title_english, //
                    jpTitle: anime.title_japanese, //
                    syn: result.synopsis, //
                    url: result.url, //
                    img: result.image_url, //
                    rating: result.score, //
                    id: result.mal_id, //
                    source: anime.source, //
                    broad: anime.aired.string, 
                    genres: anime.genres, //
                    rank: anime.rank, //
                    epsdCount: anime.episodes, //
                    fullSyn: anime.synopsis
                };
                fullSynopsis = data.fullSyn;

                let genreList = '';
                for(let i = 0; i < data.genres.length; i++){
                    genreList += data.genres[i].name;
                    if(i != data.genres.length-1) genreList += ', ';
                }

                const embed = new Discord.MessageEmbed()
                .setColor('#3bfa99')
                .setDescription(data.jpTitle + '\n' + data.title)
                .setTitle(data.enTitle)
                .setURL(data.url)
                .setImage(data.img)
                .addFields(
                    { name: 'Rating', value: data.rating, inline: true },
                    { name: 'Rank', value: data.rank, inline: true },
                    { name: 'Source', value: data.source, inline: true },
                    { name: 'Episodes', value: data.epsdCount, inline: true },
                    { name: 'Genre', value: genreList, inline: true },
                    { name: 'Airing', value: data.broad, inline: true },
                    { name: 'Synopsis', value: data.syn }
                )
                .setTimestamp();

                if(data.enTitle == null) embed.setTitle(data.title);

                message.channel.send(embed).then(m => {
                    m.react('ℹ️');
                    const filter = (reaction, user) => {
                        return reaction.emoji.name === 'ℹ️' && !user.bot;
                    };
                    const collector = m.createReactionCollector(filter, { time: 60000 });
    
                    collector.on('collect', (reaction, user) => {
                        const newEmbed = m.embeds[0];
                        newEmbed.spliceFields(6, 1, {name:'Synopsis', value: fullSynopsis});
                        m.edit(newEmbed);
                    });
                });

                
                
            })
           
        })
        
	},
};