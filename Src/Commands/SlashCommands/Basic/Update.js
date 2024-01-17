const {createEmbed} = require("../../../Utils/Embed");
module.exports = {
    name: "update",
    description: "Update data",
    run: async (client, interaction, container) => {

        await interaction.deferReply({ephemeral: true})

        /* Reloads config */
        delete require.cache[require.resolve('../../../../Config')]
        let config = require('../../../../Config')

        const mongo = client.mongo.db(config.mongo.db).collection(config.mongo.collection)

        let userData = await mongo.findOne({ discord: interaction.user.id })
        if(!userData) return interaction.editReply({ content: "Cannot load your profile. Please relink", ephemeral: true})

        /* Make sure that the ign wasn't changed */
        let currentName = await client.hypixel.getName(userData.uuid)
        if(currentName !== userData.linkedTo) {
            userData.linkedTo = currentName;
        }

        let hypixelData = await client.hypixel.getStats(currentName);
        if(!hypixelData || !hypixelData.progression.experience) return interaction.editReply("You still have no experience", { ephemeral: true })
        let level = await client.hypixel.formatStars(hypixelData.progression.experience)
        let losses = hypixelData.wool_wars.stats.games_played - hypixelData.wool_wars.stats.wins || 0;
        let stats = {
            kills: hypixelData.wool_wars.stats.kills || 0,
            wins: hypixelData.wool_wars.stats.wins || 0,
            deaths: hypixelData.wool_wars.stats.deaths || 0,
            losses: losses,
            assists: hypixelData.wool_wars.stats.assists || 0,
            power_ups: hypixelData.wool_wars.stats.powerups_gotten || 0,
            blocks_placed: hypixelData.wool_wars.stats.wool_placed || 0,
            blocks_broken: hypixelData.wool_wars.stats.blocks_broken || 0,
            games_played: hypixelData.wool_wars.stats.games_played || 0
        }
        await mongo.updateOne({discord: interaction.user.id  }, {$set: {linkedTo: currentName, level: level, stats: stats  }}, {upsert: true})
        if(config.levelRoles) {
            for(let data in config.levelRoles) {
                if(level >= data) interaction.member.roles.add(config.levelRoles[data]).catch(e => {})
            }
        }
        await interaction.member.setNickname(`[${level}✩] ${currentName}`).catch(e => {})

        config.updateEmbed.body = config.updateEmbed.body.replaceAll("{ign}", currentName)
        config.updateEmbed.body = config.updateEmbed.body.replaceAll("{lvl}", level)

        await interaction.editReply({ embeds: [ await createEmbed(config.updateEmbed)], ephemeral: true })
    }
}