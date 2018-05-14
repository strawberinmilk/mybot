"use strict"
const fs = require("fs");
const cron = require("cron").CronJob;
const request = require("request");
const async = require('async');

const sharpdate = (date) => {
  const dateList = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  if (!date && date != 0) {
    date = new Date;
    date = dateList[date.getDay() * 1];
  } else if (dateList.indexOf(date) != -1) {
  } else if ((date + "").match(/[0-6]/)) {
    date = dateList[date];
  } else {
    return null;
  }
  return date
}

const getSchoolTimeTable = date => {
  date = sharpdate(date)
  let data = " " + JSON.stringify(JSON.parse(fs.readFileSync("./data/schoolTimeTable.json", "utf8"))[date]).replace(/,/g, "\n ").replace(/"/g," ").replace(/{|}/g,"")
  if(!!data){
    return `${date}'s timeTable\n${data}`;
  }else{
    return null
  }
}

const getWeekData = date => {
  date = sharpdate(date)
  let data = " " + JSON.stringify(JSON.parse(fs.readFileSync("./data/weekData.json", "utf8"))[date]).replace(/,/g, ",\n  ").replace(/"/g," ")
  if(!!data){
    return `${date}'s task\n${data}`;
  }else{
    return null
  }
}

const getWeather = async () => {
  let weatherData = "Yokohama city weather\n"
  return new Promise(resolve => {
    request.get({
      url: "http://weather.livedoor.com/forecast/webservice/json/v1?city=140010",
    }, function (error, response, body) {
      for (let i = 0; i < 3; i++) {
        let tmp = JSON.parse(body).forecasts[i]
        if (tmp) {
          weatherData += `${tmp.date}\n  weather : ${tmp.telop}\n`
          if (tmp.temperature.max) weatherData += `  Highest temperature : ${tmp.temperature.max.celsius}℃\n`
          if (tmp.temperature.min) weatherData += `  Lowest Temperature : ${tmp.temperature.min.celsius}℃\n`
        }
      }
      resolve(weatherData)
    });
  })
}

getWeather().then(v => console.log(v))


module.exports = async robot => {
  
  //respond リプライ化が必要
  //hear 勝手に拾ってくれる
const getAll = (date) => {
  let reply = new Date + "\n"
  if(getSchoolTimeTable(date)) reply += getSchoolTimeTable(date) + "\n"
  if(getWeekData(date)) reply += getWeekData(date) + "\n"
  getWeather().then(v => {
    if(v) reply += v
    robot.send({},reply)
  })
}

robot.hear(/^!!$/i, function(msg) {
  let date = new Date
  date = date.getDay()
  msg.send(etAll(date))
});

  robot.hear(/^![0-6]$/i, function(msg) {
    let date = msg.message.text.replace(/!/,"")
    let reply = new Date + "\n"
    if(getSchoolTimeTable(date)) reply += getSchoolTimeTable(date) + "\n"
    if(getWeekData(date)) reply += getWeekData(date) + "\n"
    msg.reply(reply)
  });

  robot.hear(/^!w/i,msg => {
    getWeather().then(v => {
      robot.send({},v)
    })
  })

new cron('0 0 22 * * *', () => {
  let date = new Date
  date.setDate(date.getDate() + 1);
  date = date.getDay()
  getAll(date)
}, null, true);

};
