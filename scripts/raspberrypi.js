"use strict"
const request = require("request");
const pin = 25;

module.exports = async robot => {
  robot.hear(/lighton/i, function (msg) {
    request.get({
      url: `http://192.168.0.62:9001/?{"pin":${pin},"num":1}`,
    }, function (error, response, body) {
    })
    msg.send('ライトをつけます')
  });
  robot.hear(/lightoff/i, function (msg) {
    request.get({
      url: `http://192.168.0.62:9001/?{"pin":${pin},"num":0}`,
    }, function (error, response, body) {
    })
    msg.send('ライトを消します')
  });

};
