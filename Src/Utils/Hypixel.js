const axios = require("axios")

module.exports = class Hypixel {
    constructor(key, mongo) {
        this.mongo = mongo
        axios.get("https://api.hypixel.net/key?key=" + key).then(data => {
            this.apiKey = key
        }).catch(e => {
            if(e.response) {
                let error;
                console.log(e.response.status)
                switch (e.response.status) {
                    case 403:
                        error = "Invalid API Key";
                        break;
                    case 429:
                        error = "Rate limit exceeded";
                        break;
                }
                throw new Error(error)
            }
        })
    }

    async authenticate(ign) {
        let data = await axios.get("https://api.slothpixel.me/api/players/" + ign).catch(e => {
            throw new Error("Invalid Name")
        })
        return data.data.links;
    }

    async getStats(ign) {
        let uuid = await this.getUUID(ign)

        /* Code to get user hypixel profile from Hypixel */
        let hypixelData = await axios.get("https://api.hypixel.net/player?uuid=" + uuid, {
            headers: {
                "API-Key": this.apiKey
            }
        })

        return hypixelData.data.player.stats.WoolGames;
    }

    async formatStars(exp) {
        const minimalExp = [0, 1e3, 3e3, 6e3, 1e4, 15e3]; // NB: progression is 1k, 2k, 3k, 4k, 5k
        const baseLevel = minimalExp.length;
        const baseExp = minimalExp[minimalExp.length - 1];
        return exp < baseExp ? minimalExp.findIndex((x)=>exp < x) : Math.floor((exp - baseExp) / 5e3) + baseLevel;
    }

    async getUUID(ign) {
        /* Code to get UUID from IGN */
        let uuid = await axios.get("https://api.mojang.com/users/profiles/minecraft/" + ign)
        uuid = uuid.data.id;
        if(!uuid) throw new Error("Invalid Name");
        return uuid;
    }

    async getName(uuid) {
        /* Code to get NAME from UUID */
        let name = await axios.get("https://api.mojang.com/user/profiles/" + uuid + "/names")
        name = name.data;
        if(!name) throw new Error("Invalid UUID");
        return name[name.length - 1].name;
    }

    async getLeaders() {
        let hypixelData = await axios.get("https://api.hypixel.net/leaderboards", {
            headers: {
                "API-Key": this.apiKey
            }
        })
        delete require.cache[require.resolve('../../Config')]
        const config = require('../../Config')

        hypixelData = hypixelData.data.leaderboards.WOOL_GAMES;
        const mongo = this.mongo.db(config.mongo.db).collection(config.mongo.collection)
        for await (let obj of hypixelData) {
            if(obj.path === "wool_wars.stats.wins") {
                for await (let lbUser of obj.leaders) {
                    let name = await this.getName(lbUser);
                    let data = await this.getStats(name);
                    let level = await this.formatStars(data.progression.experience)
                    let losses = data.wool_wars.stats.games_played - data.wool_wars.stats.wins || 0;
                    let stats = {
                        kills: data.wool_wars.stats.kills || 0,
                        wins: data.wool_wars.stats.wins || 0,
                        deaths: data.wool_wars.stats.deaths || 0,
                        losses: losses,
                        assists: data.wool_wars.stats.assists || 0,
                        power_ups: data.wool_wars.stats.powerups_gotten || 0,
                        blocks_placed: data.wool_wars.stats.wool_placed || 0,
                        blocks_broken: data.wool_wars.stats.blocks_broken || 0,
                        games_played: data.wool_wars.stats.games_played || 0
                    }
                    let check = await mongo.findOne({ uuid: lbUser.replaceAll("-", "") })
                    if(!check) await mongo.updateOne({_id: lbUser.replaceAll("-", "")}, {$set: {linkedTo: name, level: level, uuid: lbUser.replaceAll("-", ""), stats: stats  }}, {upsert: true})
                    else await mongo.updateOne({_id: check._id}, {$set: {linkedTo: name, level: level, uuid: lbUser.replaceAll("-", ""), stats: stats  }}, {upsert: true})
                }
            }
        }
    }
}