const fs = require('fs')

module.exports = async robot => {
  robot.hear(/doorlog|wifilog|sleeplog/gi, function (msg) {
    let time = new Date
    let text = `${time.toJSON()},${msg.message.text},\n`
    fs.appendFileSync('./data/lifelog.csv',text,'utf8')
  })
  robot.hear(/lifelog dump/gi ,(msg)=>{
    msg.send(fs.readFileSync('./data/lifelog.csv','utf8'))
  })
}