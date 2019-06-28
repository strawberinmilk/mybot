const fs = require("fs")
module.exports = async robot => {
  robot.hear(/sleepLog/gi, function (msg) {
    let lastTime
    try{
      lastTime = new Date(fs.readFileSync("./data/sleepLogLast.txt","utf8"))
    }catch(e){
      lastTime = new Date()
    }
    let nowTime = msg.message.text.match(/-d/gi) ? new Date(msg.message.text.replace(/.+\-d\s+/,"")+"") : new Date()
    let sec = Math.floor((nowTime.getTime()-lastTime.getTime())/1000)
    let min = 0
    let hou = 0
    for(hou=0;60*60<=sec;hou++) sec = sec-60*60
    for(min=0;   60<=sec;min++) sec = sec-60
    if(min<10) min = "0"+min
    if(sec<10) sec = "0"+sec
    let text
    text  = `${nowTime.toString()},`
    text += msg.message.text.match(/poyashimi/gi) ? "就寝" : "起床"
    text += `,${hou}:${min}:${sec}`
    text += "\n"
    fs.appendFileSync("./data/sleepLog.csv",text,"utf8")
    fs.writeFileSync("./data/sleepLogLast.txt",nowTime.toString(),"utf8")
    msg.send(text)
    if(msg.message.text.match(/pokita/gi)){
      require('wake_on_lan').wake(require('./ignore.js').asus_windws_macadress)
    }
  })
}
