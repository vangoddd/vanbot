
module.exports = {
	name: 'hotsauce',
	description: 'Display pp of an osu user',
    aliases: ['hs'],
    usage: '\n<!hotsauce> taglist\n!hotsauce <tag>',
	execute(message, args) {

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        const client = message.client;
        //channel id 819024823627546635 Sauce database
        let content = null;
        let sauces = null;
        let tagMap = [];
        let tagName = [];

        client.channels.fetch('819024823627546635')
        .then(channel => {
            channel.messages.fetch('819024834742059038').then(res =>{
                //saving the datas
                content = res.content.split("\n");
                
                for(let i = 0; i < content.length; i++){
                    if(content[i].startsWith("*")) {
                        tagMap.push([content[i].slice(1), String(i)]);
                        tagName.push(content[i].slice(1));
                    };
                }
                console.log(tagMap);
                console.log(tagMap[1][1]);
                //printing all randoms
                if(!args.length){
                    let index = getRandomInt(content.length-1) + 1;
                    while(content[index].startsWith('*') || content[index].startsWith('/') || content[index].startsWith("```")){
                        index++;
                        if(index >= content.length-1){
                            index = 1;
                        }
                    }
                    let tags = null;
                    for(let i = 0; i < tagName.length; i++){
                        if(index > Number(tagMap[i][1])){
                            tags = tagMap[i][0];
                        }
                    }
                    message.channel.send("```(" + tags + ") " + content[index] + "```");
                    console.log(args);

                }else if(args[0] == 'taglist'){
                    //printing the tags
                    message.channel.send(tagName.join(', '));
                }else if(args[0].toLowerCase() == 'all'){
                    let tempContent = "";
                    for(let i = 1; i < content.length-1; i++){
                        if(!content[i].startsWith("/")) tempContent += content[i] + "\n";
                    }
                    console.log(tempContent);
                    message.channel.send("```" + tempContent + "total : " + (content.length - (tagName.length*2) - 2) +"```");

                }else{ 
                //printing the actual sauce
                    let lowerBoundIndex = Number(tagName.findIndex(element => element == args.join(' ').toLowerCase()));
                    let upperBound = content.length-1;
                    let lowerBound = Number(tagMap[lowerBoundIndex][1]);
                    
                    if(lowerBound.toString() != tagMap[tagName.length-1][1]){
                        console.log(typeof lowerBound + lowerBound);
                        upperBound = Number(tagMap[lowerBoundIndex+1][1]);
                    }
                    let random = getRandomInt(upperBound - lowerBound - 2) + lowerBound + 1;
                    console.log('random index : '+ random +' from collection : '+ tagName[lowerBoundIndex]);
                    message.channel.send("```" + content[random] + "```");
                }


            })
        })
        .catch(console.error);

	},
};