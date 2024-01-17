const {createEmbed} = require("../../../Utils/Embed");
const config = require("../../../../Config");
module.exports = {
    name: "verify",
    options: [{
        name: "name",
        type: "STRING",
        description: "Minecraft account name to link.",
        required: true
    }],
    description: "Link minecraft account to discord for hypixel",
    run: async (client, interaction, container) => {

        await interaction.deferReply({ephemeral: true})
        /* Reloads config */
        delete require.cache[require.resolve('../../../../Config')]
        let config = require('../../../../Config')

        let user = interaction.options.getString("name")
        user = await client.hypixel.getName(await client.hypixel.getUUID(user))

        const mongo = client.mongo.db(config.mongo.db).collection(config.mongo.collection)
        let userData = await mongo.findOne({ discord: interaction.user.id })
        if(userData && userData.linkedTo.toLowerCase() === user.toLowerCase()) return interaction.editReply({ content: "You are already linked to this account", ephemeral: true })

        const error = new container.Discord.MessageEmbed()
            .setColor('RED')
            .setTimestamp()
        let socials = await client.hypixel.authenticate(user).catch(e => {
            error.setTitle(e.message);
            return interaction.editReply({embeds: [error]})
        })

        if (!socials || !socials.DISCORD) return interaction.reply({
            embeds: [await createEmbed(config.howToVerifyEmbed)],
            ephemeral: true
        })

        if (socials.DISCORD === interaction.user.tag) {
            let data = await client.hypixel.getStats(user)
            if(!data || !data.progression.experience) {
                let checking = await mongo.findOne({ _id: await client.hypixel.getUUID(user) })
                if(checking) await mongo.deleteOne({ _id: await client.hypixel.getUUID(user) })
                await mongo.updateOne({_id: await client.hypixel.getUUID(user)}, {$set: {linkedTo: user, level: 0, uuid: await client.hypixel.getUUID(user), discord: interaction.user.id}}, {upsert: true})
                config.successEmbed.body = config.successEmbed.body.replaceAll("{ign}", user)
                config.successEmbed.body = config.successEmbed.body.replaceAll("{lvl}", "0")
                await interaction.editReply({
                    embeds: [await createEmbed(config.successEmbed)],
                    ephemeral: true
                })
                await interaction.member.setNickname(`[0✩] ${user}`).catch(e => {})
            } else {
                let level = await client.hypixel.formatStars(data.progression.experience)
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
                let checking = await mongo.findOne({ _id: await client.hypixel.getUUID(user) })
                if(checking) await mongo.deleteOne({ _id: await client.hypixel.getUUID(user) });
                await mongo.updateOne({_id: await client.hypixel.getUUID(user)}, {$set: {linkedTo: user, level: level, uuid: await client.hypixel.getUUID(user), stats: stats, discord: interaction.user.id  }}, {upsert: true})
                if(config.levelRoles) {
                    for(let data in config.levelRoles) {
                        if(level >= data) interaction.member.roles.add(config.levelRoles[data]).catch(e => {})
                    }
                }
                config.successEmbed.body = config.successEmbed.body.replaceAll("{ign}", user)
                config.successEmbed.body = config.successEmbed.body.replaceAll("{lvl}", level)
                await interaction.editReply({
                    embeds: [await createEmbed(config.successEmbed)],
                    ephemeral: true
                })
                await interaction.member.setNickname(`[${level}✩] ${user}`).catch(e => {})
            }

            if(config.verifiedRole && !interaction.member.roles.cache.has(config.verifiedRole)) {
                interaction.member.roles.add(config.verifiedRole).catch(e => {})
            }


        } else {
            config.failedEmbed.body = config.failedEmbed.body.replaceAll("{ign}", user)
            config.failedEmbed.body = config.failedEmbed.body.replaceAll("{linked-discord}", socials.DISCORD)
            await interaction.editReply({embeds: [await createEmbed(config.failedEmbed)], ephemeral: true})
        }
    }
}