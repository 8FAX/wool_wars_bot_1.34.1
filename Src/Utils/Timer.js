const axios = require('axios');
const {MessageEmbed} = require("discord.js");
const config = require("../../Config");
const tmp = require('tmp');
var fs = require('fs');

module.exports = class Timer {
    constructor(bot, time) {
        this.bot = bot;
        this.time = time;
    }

    async start() {
        this.timer = setInterval(() => this.check(), this.time)
        setInterval(() => this.buildFile(), 60000)
    }

    async check() {
        await this.bot.hypixel.getLeaders();
        delete require.cache[require.resolve('../../Config')]
        const config = require('../../Config')
        let time = (Math.round(Date.now() / 1000) + this.time/1000)
        let mongoData = await this.bot.mongo.db(config.mongo.db).collection("infoStore")
        for(let property in config.lb.channels) {
            let type = property;
            property = "stats." + property
            let mongo = await this.bot.mongo.db(config.mongo.db).collection(config.mongo.collection).find({}).sort({[property]: -1}).limit(15);
            let lb = `Updates in <t:${time}:R>\n\n`;
            let i = 0;
            for await (const x of mongo) {
                i++
                let user;
                if(!x.discord) {
                    user = x.linkedTo
                } else {
                    user = await this.bot.users.fetch(x.discord) || x.linkedTo;
                }
                lb = lb + `#${i} ${user}: ${x.stats[type]} ${type.replaceAll("_", " ")} \n`
            }
            let embed = await this.buildEmbed(lb, (type.charAt(0).toUpperCase() + type.slice(1)).replaceAll("_", " ") + " leaderboard", "RANDOM")
            let chnl = await this.bot.channels.cache.get(config.lb.channels[type])
            let data = await mongoData.findOne({ _id: type })
            if(!data) {
                let m = await chnl.send({embeds: [embed]})
                await mongoData.updateOne({ _id: type }, { $set: { id: m.id } }, { upsert: true })
            } else {
                await chnl.messages.edit(data.id, {embeds: [embed]})
            }
        }
    }

    async buildFile() {
        let date = new Date()
        if(date.getDay() === 0 && date.getHours() === 12 && date.getMinutes() === 0) {
            delete require.cache[require.resolve('../../Config')]
            const config = require('../../Config')
            let mongoData = await this.bot.mongo.db(config.mongo.db).collection("infoStore")
            let allLb = [];
            for (let property in config.lb.channels) {
                let type = property;
                property = "stats." + property
                let mongo = await this.bot.mongo.db(config.mongo.db).collection(config.mongo.collection).find({}).sort({[property]: -1}).limit(15);
                let lb = (type.charAt(0).toUpperCase() + type.slice(1)).replaceAll("_", " ") + " leaderboard \n";
                let i = 0;
                for await (const x of mongo) {
                    i++
                    let user;
                    if(!x.discord) {
                        user = x.linkedTo
                    } else {
                        user = await this.bot.users.fetch(x.discord);
                        if (!user) user = x.linkedTo
                        else user = user.username + "#" + user.discriminator
                    }
                    lb = lb + `#${i} ${user}: ${x.stats[type]} ${type.replaceAll("_", " ")} \n`
                }
                allLb.push(lb)
            }
            let chnl = await this.bot.channels.cache.get(config.lb.textChannel)
            const tmpobj = tmp.fileSync({mode: 0o644, prefix: 'lb', postfix: '.txt'});
            console.log('File: ', tmpobj.name);
            fs.writeFileSync(tmpobj.name, allLb.join("\n\n"))
            chnl.send({files: [tmpobj.name]})
            tmp.setGracefulCleanup();
        }
    }

    async buildEmbed(data, title, color, footer) {
        return new MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setDescription(data)
            .setTimestamp()
            // .setFooter({ text: footer})
    }
}
