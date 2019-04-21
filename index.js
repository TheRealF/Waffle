//Waffle made by CodingGuy#2555

// Import the discord.js module
const Discord = require("discord.js");
const client = new Discord.Client();
const {
    Client,
    RichEmbed
} = require('discord.js');
const config = require("./config.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity(`-help | I live in ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('guildMemberAdd', member => {
   if(!config.welcomedm) return;
    member.send(config.welcomedm);
   if(!config.addrole) return;
    member.addRole(member.guild.roles.find(role => role.name === config.addrole));

});
client.on('guildMemberRemove', member => {
    var x = member.user.tag;
    client.channels.find(chan => chan.id === config.log).send(`**${x}** left the server`);
});
client.on("message", async message => {
  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "ping") {
    const m = await message.channel.send("⏳");
    m.edit(`Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

  if(command === "say") {
        if(!message.member.roles.some(role=>[config.admin].includes(role.name)) )
      return message.reply("Sorry, you don't have permissions to use this command!");
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{});
    message.channel.send(sayMessage);
  }

  if(command === "kick") {
    if(!message.member.roles.some(role=>[config.admin, config.mod].includes(role.name)) )
      return message.reply("Sorry, you don't have permissions to use this command!");
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable)
      return message.reply("I cannot kick this user!");
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";

    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }

  if(command === "ban") {
    if(!message.member.roles.some(role=>[config.admin].includes(role.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable)
      return message.reply("I cannot ban this user!");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";

    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }

  if(command === "clean") {
    if(!message.member.roles.some(role=>[config.admin].includes(role.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    const deleteCount = parseInt(args[0], 10);
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
  if (command === "hello") {
      let options = config.hello;
      let response = options[Math.floor(Math.random() * options.length)];
      message.channel.send(response).then().catch(error => message.reply(`Error: ${error}`));

  }
  if (command === "birthday") {
      let bir = message.guild.createdAt;
      let guildName = message.guild.name;
      if(!bir) return message.reply("Unknown");
      message.channel.send(guildName+" created at: "+bir);
  }
  if (command === "show") {
      let c = message.guild.channels;
      let guildName = message.guild.name;
      c.sweep(b => b.type == "category" || b.type == "voice")
      let t = c.array();
      let print = t.sort((a, b) => a.position - b.position);
      message.channel.send("**"+guildName+"\nCHANNELS LIST:**\n\n"+print);
  }


  if (command === "new") {
     //Creates a new channel
    let forbid = 'QWERTYUIOPASDFGHJKLZXCVBNM_.,;:òàùèì+é*ç°§!|£$%&/?=^+';
    for (var i = 0; i < forbid.length; i++) {
    if (message.content.includes(forbid[i])) {
      return message.reply("Forbidden character detected, you're allowed to use only [a-z, 0-9, -]");
    }
    }

      let idprint = args.join(" ");
      let requester = message.author.username;
      let onlinemembers = message.guild.members.filter(m => m.presence.status === 'online').size;
      let minvotes = 2 + Math.floor(5 * onlinemembers / 100);
      let voteid = requester + "-" + idprint;
      let min = 1;
      let max = 100000;
      var time = config.time;
      const msgvote = new RichEmbed() //Create the embed message to send as a reply
          // Set the title of the field
          .setTitle('New Category requested by ' + requester)
          // Set the color of the embed
          .setColor(0xFFFF66)
          // Set the main content of the embed
          .setDescription('Voting will close in '+((config.time /1000) /60)+ 'minutes.\n Minimum 👍 required for approval: ' + minvotes)

          .setFooter("Requested by " + requester);
      // Send the embed to the same channel as the message
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
              time: config.time
          });

          collector.on('collect', (reaction, reactionCollector) => {
              ups = ups + 1;
          });

          const collector2 = embedMessage.createReactionCollector(filter2, {
              time: config.time
          });
          collector2.on('collect', (reaction, reactionCollector) => {
              downs = downs + 1;
          });
      })

      setTimeout(function() {
          if (ups > downs && ups >= minvotes) {
              message.guild.createRole({ //create new role
                      name: idprint,
                      color: 'GREEN',
                  })
                  .then(role => message.channel.send(`Created new role with name ${role.name} and color ${role.color}`))
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
              var idvoice = idprint + "-voice";
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
                      else message.reply(`One of the channels is missing:\nCategory: ${!!category1}\nChannel: ${!!channel1}`);
                      if (category1 && voice1) voice1.setParent(category1.id); //Set parent category of the new channel
                      else message.reply(`One of the channels is missing:\nCategory: ${!!category1}\nChannel: ${!!channel1}`);
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
      }, (config.time+10000) );
  }

  if (command === "request") {
      let requester = message.author.username;
      let check = message.author;
      let t = args.join(" ");
      let chan = message.guild.channels.find(y => y.name == t);
      if(!check || !chan || !requester)
      return message.reply("No valid channel or request has failed. Remember to write channel name without #")
      if (chan.permissionsFor(check).has('VIEW_CHANNEL')) {
          message.channel.send("You have already access to " + chan);
      } else {
          message.channel.send("Request sent in " + chan);
          chan.send("@" + requester + " requested to be added to " + chan);
      }
}
      if (command === "add") {
          let useradd = message.mentions.members.first();
          let roleName = args.slice(1).join(' ');
          let guildname = message.guild.name;
          let role = message.guild.roles.find(x => x.name == roleName);
          let chan = message.guild.channels.find(x => x.name == roleName);
          if (chan.permissionsFor(useradd).has('VIEW_CHANNEL'))
          return message.reply("that user has already access to " + chan);
          if(!chan)
          return message.reply(chan+" is not a valid channel. Remember to write channel name without # ");
          if (!useradd)
          return message.reply("cannot find any user with this username. Write only username");
          if (!role)
          return message.reply(roleName + "role does not exist in " + guildname + " yet");
          if(useradd){
                  await useradd.addRole(role)
                       .catch(error => message.reply(`Sorry ${message.author} I couldn't add ${useradd} because of : ${error}`));
                  message.reply(`${useradd} has been added to ${roleName}`);
          }
          }
  if (command === ('help')) {
      const embed = new RichEmbed()
          // Set the title of the field
          .setTitle('Here is the list of Waffle commands')
          // Set the color of the embed
          .setColor(0x76ecde)
          // Set the main content of the embed
          .setDescription("  -new ChannelName\n```Request the creation of a new channel```\n-add MemberMention ChannelName\n```Add a member in a channel```\n-show\n```List all text channels in the server```\n-request ChannelName\n```Request to be added in a channel```\n-ping \n```Ping time in ms```\n-birthday \n```Shows Server creation date```\n-hello \n```Say hello```\n-say \n```Let the bot say something```\n-kick MemberMention Reason(optional) \n```Kick the mentioned member```\n-ban MemberMention Reason(optional) \n```Ban the mentioned member```\n-clear Number \n```Delete previous messages```");
      // Send the embed to the same channel as the message
      message.channel.send(embed);
}



});

client.login(config.token);
