//Waffle made by CodingGuy#2555

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

//Logging the bot
client.on('ready', function() {
    var channel = c.DISCORD_CHANNEL_ID;
    app.post(c.WEBHOOK, function(request, response) {
        var body = request.rawBody;
        console.log("[INFO] Received " + body);
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


client.on('guildMemberAdd', member => {
    member.addRole(member.guild.roles.find(role => role.name === "Guest"));
    member.send("Hello " + member + "!" + "\n**The Family welcomes you.**\n\nNow that you joined us you should select roles to view more channels in **#welcome** and read **#rules**\nIf you wanna join our forum visit: ***https://www.net-waf.com***\n\n **Have fun here!**");
});
client.on('guildMemberRemove', member => {
    var x = member.user.tag;
    client.channels.find(chan => chan.name === "server-admins").send(`**${x}** left server`);
});

//Commands start here
client.on('message', function(message) {
    if (!message.content.startsWith("-")) { //check if command starts with -
        return;
    }
    if (message.author.bot === true) { //ignores other bots
        return;
    }
    if (message.content === ('-viroo')) {
        message.channel.send("Is a noob.");
    } else if (message.content === ('-hello' || '-hi' || "-hey")) {
        var options = ["Hello", "Hi", "Hello there", "I’m going to make you an offer you can’t refuse", "Go ahead, make my day.", "May the Force be with you"];
        var response = options[Math.floor(Math.random() * options.length)];
        message.channel.send(response).then().catch(console.error);

    } else if (message.content === ("-ping")) {
        message.channel.send(new Date().getTime() - message.createdTimestamp + " ms");
    } else if (message.content === ('-new')) {
        const embed = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('There is an error')
            // Set the color of the embed
            .setColor(0xFF0000)
            // Set the main content of the embed
            .setDescription("You should type a word or a phrase after new.\nE.g. -new ChannelName");
        // Send the embed to the same channel as the message
        message.channel.send(embed);

    } else if (message.content.startsWith("-new")) { //Create a new channel
        var temp = message.content;
        var le = temp.length;
        var idprint = temp.substring(5, le);
        /*var alp = 'abcdefghijklmnopqrstuvwxyz-';
        var idprint;
          for(let i = 0; i<alp.legth; i++){
            let h = alp[i];
            if(tp2.includes(h)){
              idprint.push(h);
          }
        }*/
        var requester = message.author.username;
        var onlinemembers = message.guild.members.filter(m => m.presence.status === 'online').size;
        var minvotes = 2 + Math.floor(5 * onlinemembers / 100);
        var voteid = requester + "-" + idprint;
        var min = 1;
        var max = 100000;
        const msgvote = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('New Category requested by ' + requester)
            // Set the color of the embed
            .setColor(0xFFFF66)
            // Set the main content of the embed
            .setDescription('Voting will close in 10 minutes.\n Minimum 👍 required for approval: ' + minvotes)

            .setFooter("Requested by " + requester);
        // Send the embed to the same channel as the message
        console.log("New vote requested with id: " + voteid)
        var ups = 1;
        var downs = 1;
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
                time: 600000
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
                time: 600000
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

        setTimeout(function() {
            console.log("TEST" + ups);
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
                            .setDescription('Generated Channel is: ' + idprint)

                            .setFooter("Requested by " + requester);
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



            }
        }, 605000);
    } else if (message.content === ('-help')) {
        const embed3 = new RichEmbed()
            // Set the title of the field
            .setTitle('Here is the list of Waffle commands')
            // Set the color of the embed
            .setColor(0x76ecde)
            // Set the main content of the embed
            .setDescription("  -new ChannelName\n```Request the creation of a new channel```\n-add Member\n```Add a member in the channel where the command is typed in```\n-show\n```List all text channels```\n-request #ChannelName\n```Request to be added in a channel```");
        // Send the embed to the same channel as the message
        message.channel.send(embed3)

    } else if (message.content === ('-add')) {
        const embed = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('There is an error')
            // Set the color of the embed
            .setColor(0xFF0000)
            // Set the main content of the embed
            .setDescription("You should mention a member of your server after using add.\nE.g. -add @username");
        // Send the embed to the same channel as the message
        message.channel.send(embed);

    } else if (message.content.startsWith('-add')) {
        var useradd = message.mentions.members.first();
        var roleName = message.channel.name;
        var guildname = message.guild.name;
        let role = message.guild.roles.find(x => x.name == roleName);
        if (!useradd)
            message.channel.send("You did not mention any user. Remember to use @");
        else {
            if (!role) {
                message.channel.send(roleName + "role does not exist in " + guildname + " yet");
            } else {
                useradd.addRole(role);
                message.channel.send(useradd + " added to " + roleName);
                console.log("User added");
            }
        }
    } else if (message.content === ('-show')) {
        var c = message.guild.channels;
        c.sweep(b => b.type == "category" || b.type == "voice")
        var t = c.array();
        var print = t.sort((a, b) => a.position - b.position);
        message.channel.send(print);
        console.log("Showing Channels");
    } else if (message.content === ('-request')) {
        const embed8 = new RichEmbed() //Create the embed message to send as a reply
            // Set the title of the field
            .setTitle('There is an error')
            // Set the color of the embed
            .setColor(0xFF0000)
            // Set the main content of the embed
            .setDescription("You should type the channel you want to be added in after using -request.\nE.g. -request #channelname");
        // Send the embed to the same channel as the message
        message.channel.send(embed8);
    } else if (message.content.startsWith('-request')) {
        var requester = message.author.username;
        var check = message.author.id;
        var chan = message.mentions.channels.first();
        if (chan.permissionsFor(check).has('VIEW_CHANNEL')) {
            message.channel.send("You have already have access to " + chan);
            console.log("Request failed");
        } else {
            message.channel.send("Request sent in " + chan);
            chan.send("@" + requester + " requested to be added to " + chan);
            console.log("Request sent");
        }
    } else if (message.content === ('-birthday')) {
        message.channel.send("WAF Community was born in 2018-07-27, 21:26:17");
    }
    /*else if (message.content.startsWith("-mc")) {
           if (message.channel.id === message.guild.channels.get(c.DISCORD_CHANNEL_ID).id) {
               if (message.author.id !== client.user.id) {
                   var client = new Rcon(c.MINECRAFT_SERVER_RCON_IP, c.MINECRAFT_SERVER_RCON_PORT); // create rcon client
                   client.auth(c.MINECRAFT_SERVER_RCON_PASSWORD, function(err) { // only authenticate when needed
                       if (message.content.startsWith("-mchelp")) { //help list
                           var channel = c.DISCORD_CHANNEL_ID;
                           client.channels.get(channel).send("```" +
                               "+-------------------------------------------------------------------+" +
                               "\n" + "| Commands     Properties                 Permissions               |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" +
                               "| -mctime      | (set/add) (amount)       | everyone                  |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" +
                               "| -mcgamemode  | (gamemode)               | Godfathers                |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" +
                               "| -mctp        | (player) (coords/player) | Godfathers & Consiglieres |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" +
                               "| -mclist      |                          | everyone                  |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" +
                               "| -mcgive      | (player) (item id)       | Godfathers                |" +
                               "\n" + "+-------------------------------------------------------------------+" + "\n" +
                               "| -mcweather   | (weather)                | everyone                  |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" +
                               "| -mcwhitelist | (add/remove) (player)    | Godfathers                |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" +
                               "| -mcspawn     | (player)                 | Godfathers & Consiglieres |" + "\n" +
                               "+-------------------------------------------------------------------+" + "\n" + "```");
                           client.close(); //close rcon client
                       } else if (message.content.startsWith("-mclist")) {
                           client.command(message.content.substring(1), function(err, resp) { // Execute command
                               var channel = c.DISCORD_CHANNEL_ID;
                               client.channels.get(channel).send("Command sent");
                               var channel = c.DISCORD_LOG_ID;
                               client.channels.get(channel).send(resp);
                               client.close(); //close rcon client
                           });
                       } else if (message.content.startsWith("-mctime")) {
                           client.command(message.content.substring(1), function(err, resp) { // Execute command
                               var channel = c.DISCORD_CHANNEL_ID;
                               client.channels.get(channel).send("Command sent");
                               var channel = c.DISCORD_LOG_ID;
                               client.channels.get(channel).send(resp);
                               client.close(); //close rcon client
                           });
                       } else if (message.content.startsWith("-mcweather")) {
                           client.command(message.content.substring(1), function(err, resp) { // Execute command
                               var channel = c.DISCORD_CHANNEL_ID;
                               client.channels.get(channel).send("Command sent");
                               var channel = c.DISCORD_LOG_ID;
                               client.channels.get(channel).send(resp);
                               client.close(); //close rcon client
                           });
                       } else if ((message.member.roles.find("name", "Godfather (ADMIN)") || message.member.roles.find("name", "Consigliere (MOD)")) && message.content.startsWith("-mcspawn")) {
                           var username = message.content.substring(7);
                           client.command('/tp ' + username + " -848 69 -1040", function(err, resp) { // Execute command
                               var channel = c.DISCORD_CHANNEL_ID;
                               client.channels.get(channel).send("Command sent");
                               var channel = c.DISCORD_LOG_ID;
                               client.channels.get(channel).send(resp);
                               client.close(); //close rcon client
                           });
                       } else if ((message.member.roles.find("name", "Godfather (ADMIN)") || message.member.roles.find("name", "Consigliere (MOD)")) && message.content.startsWith("-mctp")) {
                           client.command(message.content.substring(1), function(err, resp) { // Execute command
                               var channel = c.DISCORD_CHANNEL_ID;
                               client.channels.get(channel).send("Command sent");
                               var channel = c.DISCORD_LOG_ID;
                               client.channels.get(channel).send(resp);
                               client.close(); //close rcon client
                           });
                       } else if (!(message.member.roles.find("name", "Godfather (ADMIN)") || message.member.roles.find("name", "Consigliere (MOD)")) && message.content.startsWith("-")) {
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
       } else if (message.content.startsWith("-mc")){
         message.channel.send("You did not setted up properly Minecraft config.json file or you typed an invalid command")
         console.log("Invalid mc command");*/
    else {
        var options = ["What?", "Sorry my creator is a noob and did not coded anything for this command", "I’m as mad as hell, and I’m not going to take this anymore!", "WTF? I do not speak Noobese", "Wrong."];
        var response = options[Math.floor(Math.random() * options.length)];
        message.channel.send(response).then().catch(console.error);
        console.log("Invalid Command");
    }
});

client.login(c.DISCORD_TOKEN);

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
}
