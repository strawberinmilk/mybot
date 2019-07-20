const fs = require("fs")

fs.appendFileSync('./data/sleepLog.csv','','utf8')
fs.appendFileSync('./data/temp/lastpoyashimitemp.txt','','utf8')
fs.appendFileSync('./data/temp/lastpoyashimi.txt','','utf8')
fs.appendFileSync('./data/temp/lastSleepLog.txt','','utf8')

module.exports = async robot => {
  robot.hear(/sleepLog/gi, function (msg) {
    if(msg.message.text.match(/dump/gi)){
      msg.send(fs.readFileSync("./data/sleepLog.csv","utf8"))
      return
    }
    let lastTime
    try{
      if(msg.message.text.match(/pokita/gi)){
        lastTime = new Date(fs.readFileSync("./data/temp/lastpoyashimi.txt","utf8"))
      }else{
        lastTime = new Date(fs.readFileSync("./data/temp/lastSleepLog.txt","utf8"))
      }
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
//    text  = `${nowTime.toString()},`
    text  = `${nowTime.toLocaleString()},`
    text += msg.message.text.match(/poyashimi/gi) ? "就寝" : "起床"
    text += `,${hou}:${min}:${sec}`
    text += "\n"
    msg.send(text)
    if(msg.message.text.match(/now/gi)){
      return
    }
    fs.writeFileSync('./data/temp/lastSleepLog.txt',nowTime.toLocaleString(),'utf8')
    if(msg.message.text.match(/pokita/gi)){
      require('wake_on_lan').wake(require('./ignore.js').asus_windws_macadress)
      fs.writeFileSync('./data/temp/lastpoyashimitemp.txt',text,'utf8')
    }
    if(msg.message.text.match(/poyashimi/gi)){
      fs.appendFileSync("./data/sleepLog.csv",`${fs.readFileSync('./data/temp/lastpoyashimitemp.txt','utf8')}`,"utf8")
      fs.writeFileSync('./data/temp/lastpoyashimitemp.txt','','utf8')
      fs.appendFileSync("./data/sleepLog.csv",text,"utf8")
      fs.writeFileSync("./data/temp/lastpoyashimi.txt",nowTime.toLocaleString(),"utf8")
    }
  })
}
