const Discord = require("discord.js");
const fs = require('fs');
const config = require("./config.json");
const client = new Discord.Client();
const googleFile = require("./google.js");
let authentication;
let channel;

client.on("ready", () => {
  console.log(`Bot is online!`);
  client.user.setActivity('your schedule', { type: 'WATCHING' });
  channel = client.channels.cache.find(
    (channel) => channel.name === config.channel
  );

  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    googleFile.authorize(JSON.parse(content), runEventListener, channel);
  });
});

async function runEventListener(auth){
  authentication = auth;

  while(true){
    await googleFile.listEvents(auth, channel)
  }

}

function sendMessage(message) {
  channel.send(message);
}

client.login(config.token);
