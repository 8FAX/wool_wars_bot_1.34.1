module.exports = {
    prefix: ["!"],
    developers: ["8FA", 223433394023956480 ],
    token: "-",
    activity: "Beep Boop",
    hypixelApi: "-",
    mongo: {
        uri: "-",
        db: "bot",
        collection: "link"
    },
    levelRoles: {
        20: "980873709638262878",
        50: "993231975030730813",
        100: "984958937113690122",
        200: "992486592029663403"
    },
    verifiedRole: "981724425038753792",
    howToVerifyEmbed: {
        title: "Welcome!",
        author: "Wool Wars Bot",
        authorImage: "https://cdn.discordapp.com/attachments/924376718528090212/952632415044644924/Aiko.png",
        color: "#5655ff",
        image: "https://cdn.discordapp.com/attachments/924376718528090212/952632415044644924/Aiko.png",
        thumbnail: "https://cdn.discordapp.com/attachments/924376718528090212/952632415044644924/Aiko.png",
        showTimestamp: true,
        footer: "This is an example Footer!",
        fields: [
            {
                title: "Test1",
                text: "This is text of Test1"
            },
            {
                title: "Test1",
                text: "This is text of Test1"
            }
        ],
        body: "You have successfully linked your discord to {ign}"
    },
    successEmbed: {
        title: "You have successfully linked your discord",
        authorImage: "https://cdn.discordapp.com/attachments/979073662978261042/979551685410193458/W-w-5-26-2022.png?size=4096",
        color: "#5655ff",
        image: "https://crafatar.com/renders/body/{pfp}",
        thumbnail: "https://cdn.discordapp.com/attachments/979073662978261042/979551685410193458/W-w-5-26-2022.png?size=4096",
        showTimestamp: true,
        footer: "Made by 8FA with ❤ ",
        body: "{ign} \n Your level is {lvl} \n \n Do `/update` to Resync your level!"
    },
    updateEmbed: {
        title: "You have successfully updated your account",
        authorImage: "https://cdn.discordapp.com/attachments/979073662978261042/979551685410193458/W-w-5-26-2022.png?size=4096",
        color: "#5655ff",
        image: "https://crafatar.com/renders/body/{pfp}",
        thumbnail: "https://cdn.discordapp.com/attachments/979073662978261042/979551685410193458/W-w-5-26-2022.png?size=4096",
        showTimestamp: true,
        footer: "Made by 8FA with ❤ ",
        body: "{ign} \n Your new level is {lvl}"
    },
    failedEmbed: {
        title: "Failed to link",
        author: "Wool Wars Bot",
        authorImage: "",
        color: "#ce1e3d",
        image: "https://cdn.discordapp.com/attachments/979073687355551754/980192499794608128/ezgif-2-1c8df69335.gif?size=4096",
        thumbnail: "https://cdn.discordapp.com/attachments/979073662978261042/979551685410193458/W-w-5-26-2022.png?size=4096",
        showTimestamp: true,
        footer: "Made by 8FA with ❤ ",
        fields: [],
        body: "Failed to link. Use This vidoe [Here](https://youtu.be/UresIQdoQHk?t=1) for info on how to link."
    },

    /* Data for leaderboards */
    lb: {
        channels: {
            kills: "980874328767889429",
            wins: "980874360652972133",
            deaths: "980874416231698572",
            losses: "980874392290598972",
            assists: "980874455985324122",
            power_ups: "980874481864159303",
            blocks_placed: "980874505851392080",
            blocks_broken: "980874538051076188",
            games_played: "980874562633867303",
        },
        timer: 1200000,
        textChannel: "980874755014025236"
    }
}