const lifeloge = require('./lifeloge.js')

module.exports = robot => {
  robot.hear(/doorlog|wifilog|sleeplog/gi, function (msg) {
    lifeloge(msg.message.text)
  })
  robot.hear(/lifelog dump/gi ,(msg)=>{
    msg.send(fs.readFileSync('./data/lifelog.csv','utf8'))
  })
}