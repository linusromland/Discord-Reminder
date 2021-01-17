const schedule = require('node-schedule');

schedule.scheduleJob({hour: 12, minute: 32}, () => {
    console.log('cool');
});