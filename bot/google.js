const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const lessons = require("./lessons.json");
const schedule = require("node-schedule");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, msg) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback, msg) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth, msg) {
  console.log("new listEvent");
  return new Promise(async (resolve, reject) => {
    const calendar = google.calendar({ version: "v3", auth });
    calendar.events.list(
      {
        calendarId: "cadcj4h1nolpoaep1bkkj3jc7s@group.calendar.google.com",
        timeMin: new Date().toISOString(),
        maxResults: 2,
        singleEvents: true,
        orderBy: "startTime",
      },
      async (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const events = res.data.items;
        if (events.length) {
          let startDate = new Date(
            events[0].start.dateTime || events[0].start.date
          );
          let printDate = new Date(startDate.getTime() - 300000);
          let currentDate = new Date();
          let dateOnSchedule = printDate.getFullYear().toString() + printDate.getMonth().toString() + printDate.getDate().toString()
          let dateRightNow = currentDate.getFullYear().toString() +  currentDate.getMonth().toString()  + currentDate.getDate().toString()
          if (printDate.getTime() > Date.now() && dateOnSchedule == dateRightNow) {
            await scheduleJob(events, msg, 0);
            console.log("resolv with 0");
            resolve();
          } else if(events[1]) {
            await scheduleJob(events, msg, 1);
            console.log("resolv with 1");
            resolve();
          }
          else{
            setTimeout(function() {
              resolve();
            }, 30000);
          }
        } else {
          console.log("No upcoming events found.");
          setTimeout(function() {
            resolve();
          }, 30000);
        }
      }
    );
  });
}
async function scheduleJob(events, msg, i) {
  console.log(events)
  console.log(i);
  return new Promise((resolve, reject) => {
    if (events.length) {
      console.log("passed check events.length in schedule")
      let startDate = new Date(
        events[i].start.dateTime || events[0].start.date
      );
      let printDate = new Date(startDate.getTime() - 300000);
      console.log(printDate)
      if (printDate.getTime() > Date.now()) {
        console.log("new job active at " + printDate.getMinutes());
        schedule.scheduleJob(
          { hour: printDate.getHours(), minute: printDate.getMinutes() },
          () => {
            msg.send(printFormattedMessage(events[i]));
            console.log("resolv jopn");
            resolve();
          }
        );
      } else {
      }
    } else {
      console.log("No upcoming events found.");
      reject();
    }
  });
}

function printFormattedMessage(event) {
  let tmp = "";
  lessons.lessons.forEach((element) => {
    if (event.summary == element.kurskod) {
      element.people.forEach((person) => {
        lessons.peopleId.forEach((personId) => {
          console.log(
            "person " + person,
            "element " + element,
            "id " + personId
          );
          if (person == personId.name) {
            //console.log(person.name + personId.name)
            tmp += "<@" + personId.id + ">,   ";
          }
        });
      });
    }
  });
  let notNormalLesson = false;
  if (tmp == "") {
    notNormalLesson = true
  }
  tmp += "lektionen " + event.summary + " börjar om 5 minuter!";
  
  if (notNormalLesson) {
    console.log(event)
    tmp += "\n" + event.description
  }else{
    lessons.lessons.forEach((element) => {
      if (event.summary == element.kurskod) {
        tmp += "\n Lektion finns på: " + element.meetLink;
      }
    });
  }
  return tmp;
}

module.exports = { authorize, listEvents };
