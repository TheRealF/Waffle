//Waffle made by [WAF] TheRealF#0001 aka Federico Boggia
// Import the discord.js module
const Discord = require('discord.js');
const {
    Client,
    RichEmbed
} = require('discord.js');
// Create an instance of a Discord client
const client = new Discord.Client();
//Required for reading editing external txt file
var fs = require('fs');
//Logging the bot
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
//Increment function
function increment(n) {
    n++;
    return n;
}

//Commands start here
client.on('message', function(message) {
    if (!message.content.startsWith("!")) { //check if command starts with !
        return;
    }
    if (message.author.bot === true) { //ignores other bots
        return;
    }
    if (message.content === ('!viroo')) {
        const embed = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('Viroo is a...')
            // Set the color of the embed
            .setColor(0x11d480)
            // Set the main content of the embed
            .setDescription("NOOB");
        // Send the embed to the same channel as the message
        message.channel.send(embed);

    }
    if (message.content === ('!hello')) {
        const embed = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('Hello')
            // Set the color of the embed
            .setColor(0x11d480)
            // Set the main content of the embed
            .setDescription("Nice to meet you!");
        // Send the embed to the same channel as the message
        message.channel.send(embed);

    }
    if (message.content === ('!new')) {
        const embed = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('There is an error')
            // Set the color of the embed
            .setColor("red")
            // Set the main content of the embed
            .setDescription("You should type a word or a phrase after new. !new GameName");
        // Send the embed to the same channel as the message
        message.channel.send(embed);

    }
    if (message.content.startsWith("!new")) { //Create a new channel
        var temp = message.content;
        var le = temp.length;
        var idprint = temp.substring(4, le);
        message.guild.createRole({ //create new role
                name: idprint,
                color: 'GREEN',
            })
            .then(role => console.log(`Created new role and channel with name ${role.name} and color ${role.color}`))
            .catch(console.error)

        message.guild.createChannel(idprint, "text")
            .then(m => {
                    m.overwritePermissions(message.guild.id, { //visibilty set to false for everyone
                        VIEW_CHANNEL: false
                    })

                    m.overwritePermissions(message.author.id, { //visibilty set to true for the channel creator
                        VIEW_CHANNEL: true
                    })
                    m.overwritePermissions(message.guild.roles.find(role => role.name === idprint), { //visibilty set to true for id ppl
                        VIEW_CHANNEL: true
                    })

                    message.guild.createChannel(idprint, "category")
                        .then(m => {
                            m.overwritePermissions(message.guild.id, { //visibilty set to false for everyone
                                VIEW_CHANNEL: false
                            })

                            m.overwritePermissions(message.author.id, { //visibilty set to true for the channel creator
                                VIEW_CHANNEL: true
                            })
                            m.overwritePermissions(message.guild.roles.find(role => role.name === idprint), { //visibilty set to true for id ppl
                                VIEW_CHANNEL: true
                            })

                            let category1 = message.guild.channels.find(c => c.name == idprint && c.type == "category"), //Find the category name to append the channel
                                channel1 = message.guild.channels.find(c => c.name == idprint && c.type == "text"); //Find the channel name
                            if (category1 && channel1) channel1.setParent(category1.id); //Set parent category of the new channel
                            else console.error(`One of the channels is missing:\nCategory: ${!!category1}\nChannel: ${!!channel1}`);
                            const embed = new RichEmbed() //Create the embed message to send as a reply
                                // Set the title of the field
                                .setTitle('New Channel created')
                                // Set the color of the embed
                                .setColor(0x4bb84b)
                                // Set the main content of the embed
                                .setDescription('Generated Channel is: ' + idprint);
                            // Send the embed to the same channel as the message
                            message.channel.send(embed);

                        })})



                }
 else if (message.content === ('!help')) {
        const embed = new RichEmbed()
            // Set the title of the field
            .setTitle('Here is the list of REbot commands')
            // Set the color of the embed
            .setColor(0x76ecde)
            // Set the main content of the embed
            .setDescription("```" + "| Command | Properties " + "\n" + "\n" +
                "| !vote |  " + "\n" + "\n" +
                "| !new |  " + "\n" + "\n" +
                "| !remove | remove support channel " + "\n" + "\n" +
                "|  |" + "\n" + "\n" + "```");
        // Send the embed to the same channel as the message
        message.channel.send(embed)

    } else {
        console.log("Invalid Command")
    }
});

// Insert token here
client.login('Token-Here');
