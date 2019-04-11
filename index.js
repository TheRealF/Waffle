//Waffle made by [WAF] client#0001 aka Federico Boggia
// Import the discord.js module
'use strict';
const Discord = require('discord.js');
const {
    Client,
    RichEmbed
} = require('discord.js');
// Create an instance of a Discord client
const client = new Discord.Client();
//Required for reading editing external txt file
var fs = require('fs');
var Rcon = require("./lib/rcon.js");
var express = require("express");
var app = express();
var http = require("http").Server(app);

var cfile = (process.argv.length > 2) ? process.argv[2] : "./config.json"

console.log("[INFO] Using configuration file:", cfile);

var c = require(cfile);

//Logging the bot
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
//Functions

//Increment function
function increment(n) {
    n++;
    return n;
}

function makeDiscordMessage(bodymatch) {
    // make a discord message string by formatting the configured template with the given parameters

    return c.DISCORD_MESSAGE_TEMPLATE
        .replace("%username%", bodymatch[1].replace(/(\§[A-Z-a-z-0-9])/g, ""))
        .replace("%message%", bodymatch[2]);
}

function makeMinecraftTellraw(message) {
    // same as the discord side but with discord message parameters
    /*  if(message.content.has((message.content.find("text", "<:")))){        //handle animated emojis
          return c.MINECRAFT_WARN_EMO
        }*/
    return c.MINECRAFT_TELLRAW_TEMPLATE
        .replace("%username%", "[DISCORD] " + message.author.username)
        .replace("%discriminator%", message.author.discriminator)
        .replace("%message%", message.cleanContent);
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
    else if (message.content === ('!hello')) {
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
    else if (message.content === ('!new')) {
        const embed = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('There is an error')
            // Set the color of the embed
            .setColor(0xFF0000)
            // Set the main content of the embed
            .setDescription("You should type a word or a phrase after new. !new GameName");
        // Send the embed to the same channel as the message
        message.channel.send(embed);

    }
    else if (message.content.startsWith("!new")) { //Create a new channel
        var temp = message.content;
        var le = temp.length;
        var idprint = temp.substring(5, le);
        var requester = message.author.username;
        var onlinemembers = message.guild.members.filter(m => m.presence.status === 'online').size;
        var minvotes = 5 + Math.floor(5*onlinemembers/100);
        var voteid = requester + "-" + idprint;
        var min = 1;
        var max = 100000;
        const msgvote = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('New Category requested by ' + requester)
            // Set the color of the embed
            .setColor(0xFFFF66)
            // Set the main content of the embed
            .setDescription('Voting will close in 1 hour.\n Minimum 👍 required for approval: ' + minvotes);
        // Send the embed to the same channel as the message
        console.log("New vote requested with id: " + voteid)
        var ups = 0;
        var downs = 0;
        message.channel.send(msgvote).then(async embedMessage => {
            await embedMessage.react('👍');
            await embedMessage.react('👎');
            const filter = (reaction) => {
                return reaction.emoji.name === '👍';
            };
            const filter2 = (reaction) => {
                return reaction.emoji.name === '👎';
            };
            const collector = embedMessage.createReactionCollector(filter, {
                time: 3600000
            });

            collector.on('collect', (reaction, reactionCollector) => {
                console.log(`Collected thumbs up`);
                ups = ups + 1;
            });

            collector.on('end', collected => {
                console.log(`Collected ${collected.size} thumbs up`);
                console.log(ups);
            });
            const collector2 = embedMessage.createReactionCollector(filter2, {
                time: 3600000
            });
            collector2.on('collect', (reaction, reactionCollector) => {
                console.log(`Collected thumbs down`);
                downs = downs + 1;
            });

            collector2.on('end', collected => {
                console.log(`Collected ${collected.size} thumbs down`);
                console.log(downs);
            });
        })

        setTimeout(function () {
          console.log("TEST"+ups);
          if (ups > downs && ups >= minvotes) {
            message.guild.createRole({ //create new role
                    name: idprint,
                    color: 'GREEN',
                })
                .then(role => console.log(`Created new role and channel with name ${role.name} and color ${role.color}`))
                .catch(console.error)

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
                })

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
                })
            var idvoice = idprint + "-voice"
            message.guild.createChannel(idvoice, "voice")
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
                        channel1 = message.guild.channels.find(c => c.name == idprint && c.type == "text"),
                        voice1 = message.guild.channels.find(c => c.name == idvoice && c.type == "voice"); //Find the channel name
                    if (category1 && channel1) channel1.setParent(category1.id); //Set parent category of the new channel
                    else console.error(`One of the channels is missing:\nCategory: ${!!category1}\nChannel: ${!!channel1}`);
                    if (category1 && voice1) voice1.setParent(category1.id); //Set parent category of the new channel
                    else console.error(`One of the channels is missing:\nCategory: ${!!category1}\nChannel: ${!!channel1}`);
                    const embed2 = new RichEmbed() //Create the embed message to send as a reply
                        // Set the title of the field
                        .setTitle('New Channel created')
                        // Set the color of the embed
                        .setColor(0x4bb84b)
                        // Set the main content of the embed
                        .setDescription('Generated Channel is: ' + idprint);
                    // Send the embed to the same channel as the message
                    message.channel.send(embed2);

                })


        } else {
            const embed6 = new RichEmbed() //Create the embed message to send as a reply
                // Set the title of the field
                .setTitle('Vote has ended')
                // Set the color of the embed
                .setColor(0xFF0000)
                // Set the main content of the embed
                .setDescription("Category with id: " + voteid + " not approved");
            // Send the embed to the same channel as the message
            message.channel.send(embed6);



        }}, 3615000);
    } else if (message.content === ('!help')) {
        const embed3 = new RichEmbed()
            // Set the title of the field
            .setTitle('Here is the list of Waffle commands')
            // Set the color of the embed
            .setColor(0x76ecde)
            // Set the main content of the embed
            .setDescription("```" + "| Command | Properties " + "\n" + "\n" +
                "| !vote |  " + "\n" + "\n" +
                "| !new |  " + "\n" + "\n" +
                "| !remove | remove channel " + "\n" + "\n" +
                "|  |" + "\n" + "\n" + "```");
        // Send the embed to the same channel as the message
        message.channel.send(embed3)

    } else if (message.content === ('!add')){
    const embed = new RichEmbed() //Create the embed message to send as a reply
        // Set the title of the field
        .setTitle('There is an error')
        // Set the color of the embed
        .setColor(0xFF0000)
        // Set the main content of the embed
        .setDescription("You should type a username after add. !add username");
    // Send the embed to the same channel as the message
    message.channel.send(embed);

  }

    else {
        console.log("Invalid Command")
    }
});

/*

var debug = c.DEBUG;
var rconTimeout;

app.use(function(request, response, next) {
    request.rawBody = "";
    request.setEncoding("utf8");

    request.on("data", function(chunk) {
        request.rawBody += chunk;
    });

    request.on("end", function() {
        next();
    });
});

client.on("ready", function() {
    var channel = c.DISCORD_CHANNEL_ID;
    app.post(c.WEBHOOK, function(request, response) {
        var body = request.rawBody;
        console.log("[INFO] Recieved " + body);
        var re = new RegExp(c.REGEX_MATCH_CHAT_MC);
        var ignored = new RegExp(c.REGEX_IGNORED_CHAT);
        if (!ignored.test(body)) {
            var bodymatch = body.match(re);
            if (debug) {
                console.log("[DEBUG] Username: " + bodymatch[1]);
                console.log("[DEBUG] Text: " + bodymatch[2]);
            }
            client.channels.get(channel).sendMessage(makeDiscordMessage(bodymatch));
        }
        response.send("");
    });
});

client.on("message", function(message) {
    if (message.channel.id === client.channels.get(c.DISCORD_CHANNEL_ID).id) {
        if (message.author.id !== client.user.id) {
            var client = new Rcon(c.MINECRAFT_SERVER_RCON_IP, c.MINECRAFT_SERVER_RCON_PORT); // create rcon client
            client.auth(c.MINECRAFT_SERVER_RCON_PASSWORD, function(err) { // only authenticate when needed
                if (message.content.startsWith("!mc-help")){ //help list
                     var channel = c.DISCORD_CHANNEL_ID;
                     client.channels.get(channel).send("```" +
                                      "+-------------------------------------------------------------------+"
                     + "\n" +         "| Commands     Properties                 Permissions               |" + "\n"
                                    + "+-------------------------------------------------------------------+" + "\n"
                                    + "| !time      | (set/add) (amount)       | everyone                  |" + "\n" +
                                      "+-------------------------------------------------------------------+" + "\n" +
                                      "| !gamemode  | (gamemode)               | Godfathers                |" + "\n"
                                    + "+-------------------------------------------------------------------+" + "\n" +
                                      "| !tp        | (player) (coords/player) | Godfathers & Consiglieres |"+ "\n" +
                                      "+-------------------------------------------------------------------+" + "\n" +
                                      "| !list      |                          | everyone                  |"+ "\n" +
                                      "+-------------------------------------------------------------------+" + "\n" +
                                      "| !give      | (player) (item id)       | Godfathers                |"
                     + "\n" +         "+-------------------------------------------------------------------+" + "\n" +
                                      "| !weather   | (weather)                | everyone                  |"+ "\n" +
                                      "+-------------------------------------------------------------------+"+ "\n" +
                                      "| !whitelist | (add/remove) (player)    | Godfathers                |"+ "\n" +
                                      "+-------------------------------------------------------------------+"+ "\n" +
                                      "| !spawn     | (player)                 | Godfathers & Consiglieres |"+ "\n" +
                                      "+-------------------------------------------------------------------+"+ "\n" + "```");
                     client.close(); //close rcon client
                  }
                 else if (message.content.startsWith("!list")){
                     client.command(message.content.substring(1), function(err, resp) { // Execute command
                     var channel = c.DISCORD_CHANNEL_ID;
                     client.channels.get(channel).send("Command sent");
                     var channel = c.DISCORD_LOG_ID;
                     client.channels.get(channel).send(resp);
                     client.close(); //close rcon client
                 });
                    }
                    else if (message.content.startsWith("!time")){
                        client.command(message.content.substring(1), function(err, resp) { // Execute command
                        var channel = c.DISCORD_CHANNEL_ID;
                        client.channels.get(channel).send("Command sent");
                        var channel = c.DISCORD_LOG_ID;
                        client.channels.get(channel).send(resp);
                        client.close(); //close rcon client
                    });
                       }
                       else if (message.content.startsWith("!weather")){
                           client.command(message.content.substring(1), function(err, resp) { // Execute command
                           var channel = c.DISCORD_CHANNEL_ID;
                           client.channels.get(channel).send("Command sent");
                           var channel = c.DISCORD_LOG_ID;
                           client.channels.get(channel).send(resp);
                           client.close(); //close rcon client
                       });
                          }
                else if ((message.member.roles.find("name", "Godfather (ADMIN)") || message.member.roles.find("name", "Consigliere (MOD)")) && message.content.startsWith("!spawn")) {
                    var username = message.content.substring(7);
                    client.command('/tp ' + username + " -848 69 -1040", function(err, resp) { // Execute command
                        var channel = c.DISCORD_CHANNEL_ID;
                        client.channels.get(channel).send("Command sent");
                        var channel = c.DISCORD_LOG_ID;
                        client.channels.get(channel).send(resp);
                        client.close(); //close rcon client
                    });
                }
                else if ((message.member.roles.find("name", "Godfather (ADMIN)") || message.member.roles.find("name", "Consigliere (MOD)")) && message.content.startsWith("!tp")) {
                  client.command(message.content.substring(1), function(err, resp) { // Execute command
                  var channel = c.DISCORD_CHANNEL_ID;
                  client.channels.get(channel).send("Command sent");
                  var channel = c.DISCORD_LOG_ID;
                  client.channels.get(channel).send(resp);
                  client.close(); //close rcon client
              });
                 }

                else if ((message.member.roles.find("name", "Godfather (ADMIN)") || message.member.roles.find("name", "Consigliere (MOD)")) && message.content.startsWith("!")) // Check if user has admin role and if commands starts with !
                {
                    client.command(message.content.substring(1), function(err, resp) { // Execute command
                        var channel = c.DISCORD_CHANNEL_ID;
                        client.channels.get(channel).send("Command sent");
                        var channel = c.DISCORD_LOG_ID;
                        client.channels.get(channel).send(resp);
                        client.close(); //close rcon client
                    });
                } else if (!(message.member.roles.find("name", "Godfather (ADMIN)") || message.member.roles.find("name", "Consigliere (MOD)")) && message.content.startsWith("!")) {
                    var channel = c.DISCORD_CHANNEL_ID;
                    client.channels.get(channel).send("Invalid Permission");
                } else {
                    client.command('tellraw @a ' + makeMinecraftTellraw(message), function(err, resp) {
                        client.close();
                    });
                }
            });
        }
    }
});
*/
client.login(c.DISCORD_TOKEN);
/*
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1";
var serverport = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || c.PORT;
if (process.env.OPENSHIFT_NODEJS_IP !== undefined) {
    http.listen(serverport, ipaddress, function() {
        console.log("[INFO] Bot listening on *:" + serverport);
    });
} else {
    http.listen(serverport, function() {
        console.log("[INFO] Bot listening on *:" + c.PORT);
    });
}*/
