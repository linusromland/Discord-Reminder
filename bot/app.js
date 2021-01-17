const schedule = require('node-schedule');
const Discord = require('discord.js');
const config = require('./config.json');

bot.on("ready", () => {
    bot.user.setGame('Checking you Schedule');
    console.log(`Bot is online!\n${bot.users.size} users, in ${bot.guilds.size} servers connected.`);
});

schedule.scheduleJob({hour: 12, minute: 32}, () => {
    console.log('cool');
});

bot.login(config.token);