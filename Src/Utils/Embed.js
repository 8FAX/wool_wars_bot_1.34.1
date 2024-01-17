const {MessageEmbed} = require("discord.js");

const createEmbed = async function(config) {
    let embed = new MessageEmbed();

    if(config.color) embed.setColor(config.color);
    if(config.image) embed.setImage(config.image);
    if(config.footer) embed.setFooter({ text: config.footer });
    if(config.title) embed.setTitle(config.title);
    if(config.showTimestamp) embed.setTimestamp();
    if(config.thumbnail) embed.setThumbnail(config.thumbnail);
    if(config.fields) {
        config.fields.forEach(x => {
            embed.addField(x.title, x.text)
        })
    }
    if(config.body) embed.setDescription(config.body)
    if(config.authorImage && config.author) {
        embed.setAuthor({ name: config.author, url: config.authorImage });
    } else if(config.author) {
        embed.setAuthor({ name: config.author });
    } else if(config.authorImage) {
        embed.setAuthor({ name: " ", url: config.authorImage });
    }
    return embed;
}

module.exports = {
    createEmbed
}