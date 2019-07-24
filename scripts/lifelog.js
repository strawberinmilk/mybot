const fs = require('fs')
const http = require('http')

let wifiConnect = null
let wifiTime = 0
let doorTime = 0

const log = text =>{
  fs.appendFileSync('./data/lifelog.csv',`${(new Date).toLocaleString()},${text},\n`,'utf8')
}

module.exports = async robot => {
  const check = ()=>{
    if(Math.abs(wifiTime - doorTime)<600000){
      robot.send({room:'#test_1'}, `lifelog fire ${wifiConnect} ${wifiTime - doorTime}`)
    }
  }

  robot.hear(/wifilog/gi,msg=>{
    let text = msg.message.text
    console.log('wifilog')
    text = text.replace(/to|from/gi,'')
    log(text)
    wifiTime = (new Date).getTime()
    wifiConnect = text.replace(/wifilog|\s/gi,'')
    check()
  })

  const doorlog = text =>{
    log(text)
    doorTime = (new Date).getTime()
    check()
  }

  robot.hear(/lifelog dump/gi ,(msg)=>{
    msg.send(fs.readFileSync('./data/lifelog.csv','utf8'))
  })

  http.createServer((req, res) => {
    let r;
    try{
      r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,"")));
    }catch(e){
    }
    console.log(r)
    robot.send({ room: r.channel }, r.text)
    if(r.text.match(/doorlog/gi)) doorlog(r.text)
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("sucsess")
  }).listen(9002)

}