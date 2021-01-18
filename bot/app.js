const schedule = require("node-schedule");
const Discord = require("discord.js");
const fs = require('fs');
const config = require("./config.json");
const client = new Discord.Client();
const googleFile = require("./google.js");
let channel;

client.on("ready", () => {
  console.log(`Bot is online!`);

  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    googleFile.authorize(JSON.parse(content), googleFile.listEvents, channel);
  });

  channel = client.channels.cache.find(
    (channel) => channel.name === config.channel
  );
});

function sendMessage(message) {
  channel.send(message);
}

client.login(config.token);
