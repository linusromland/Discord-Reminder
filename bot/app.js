const schedule = require('node-schedule');
const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();  
let channel;

client.on("ready", () => {
    console.log(`Bot is online!`);
    channel = client.channels.cache.find(channel => channel.name === config.channel)
});

schedule.scheduleJob({hour: 13, minute: 16}, () => {
    sendMessage('cool');
});

function sendMessage(message){
    channel.send(message)
}

client.login(config.token);