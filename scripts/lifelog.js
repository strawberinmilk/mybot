const fs = require('fs')


module.exports = async robot => {
  const lifelog = (t)=>{
    let time = new Date
    let text = `${time.toJSON()},${t},\n`
    fs.appendFileSync('./data/lifelog.csv',text,'utf8')
  }



  robot.hear(/doorlog|wifilog|sleeplog/gi, function (msg) {
    lifelog(msg.message.text)
  })
  robot.hear(/lifelog dump/gi ,(msg)=>{
    msg.send(fs.readFileSync('./data/lifelog.csv','utf8'))
  })
}