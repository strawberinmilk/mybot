const fs = require("fs")
module.exports = async robot => {
  robot.hear(/sleepLog/gi, function (msg) {
    let lastTime
    try{
      lastTime = new Date(fs.readFileSync("./data/sleepLogLast.txt","utf8"))
    }catch(e){
      lastTime = new Date()
    }
    let nowTime = new Date()
    lastTime = lastTime.getTime()
    nowTime = nowTime.getTime()
    let sec = Math.floor((nowTime-lastTime)/1000)
    let min = 0
    let hou = 0
    for(hou=0;60*60<=sec;hou++){
      sec = sec-60*60
    }
    for(min=0;60<=sec;min++){
      sec = sec-60
    }
    if(min<10) min = "0"+min
    if(sec<10) sec = "0"+sec

    let text
    text  = `${new Date},`
    text += msg.message.text.match(/poyashimi/gi) ? "就寝" : "起床"
    text += `,${hou}:${min}:${sec}`
    text += "\n"
    fs.appendFileSync("./data/sleeplog.csv",text,"utf8")
    fs.writeFileSync("./data/sleeplogLast.txt",new Date,"utf8")
    msg.send(text)
  });
}
