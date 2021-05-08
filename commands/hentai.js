const { API, } = require('nhentai-api');
const Discord = require('discord.js');

module.exports = {
	name: 'hentai',
	description: 'Search nhentai based on code (blocked by ipochan)',
    aliases: ['nh'],
    usage: '<nuclear code>',
	execute(message, args) {
        const api = new API();
        if(args == 0){
            message.channel.send('kode ne endi cok');
            return;
        }
        api.getBook(Number(args[0])).then(book => {
            const cover = api.getImageURL(book.cover);   // https://t.nhentai.net/galleries/987560/cover.jpg
            const tags = book.tags;
            const title = book.title;
            const url = "https://nhentai.net/g/" + book.id;
            const embed = new Discord.MessageEmbed()
                .setColor('#aa0000')
                .setDescription(tags)
                .setTitle(title)
                .setImage(cover)
                .setURL(url)
                .setTimestamp();
            message.channel.send(embed);
        });
	},
};