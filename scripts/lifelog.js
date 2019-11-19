const fs = require('fs')
const http = require('http')
const request = require('request')

const pin = 25

let wifiConnect = null
let wifiTime = 0
let doorTime = 0
let leave = false

const log = text =>{
  fs.appendFileSync('./data/lifelog.csv',`${(new Date).toLocaleString()},${text},\n`,'utf8')
}

module.exports = async robot => {
  const check = ()=>{
    if(Math.abs(wifiTime - doorTime)<600000){
      robot.send({room:'#test_1'}, `lifelog fire ${wifiConnect} ${wifiTime - doorTime}`)
    }
  }

  robot.hear(/lighton/i, (msg) => {
    request.get({
      url: `http://192.168.0.62:9001/?{"pin":${pin},"num":1}`,
    }, (error, response, body) => {
    })
    msg.send('ライトをつけます')
  })
  robot.hear(/lightoff/i, (msg) => {
    request.get({
      url: `http://192.168.0.62:9001/?{"pin":${pin},"num":0}`,
    }, (error, response, body) => {
    })
    msg.send('ライトを消します')
  })

  //robot.hear(/wifilog/gi,msg=>{
  //  let text = msg.message.text
  //  console.log('wifilog')
  //  text = text.replace(/to|from/gi,'')
  //  log(text)
  //  wifiTime = (new Date).getTime()
  //  wifiConnect = text.replace(/wifilog|\s/gi,'')
  //  check()
  //})

  const doorlog = text =>{
    log(text)
    doorTime = (new Date).getTime()
    check()
  }

  
  //leave
  robot.hear(/leave/gi,msg=>{
    clearTimeout(leave)
    leave = setTimeout(()=>{
      fs.appendFileSync('./data/lalog.csv',`${(new Date).toLocaleString()},leave,\n`,'utf8')
      request.get({
        url: `http://192.168.0.62:9001/?{"pin":${pin},"num":1}`,
      }, (error, response, body)=> {
      })
      clearTimeout(leave)
      leave = 'leave'
    },600000)
    msg.send('leave')
  })

  robot.hear(/lifelog dump/gi ,(msg)=>{
    msg.send(fs.readFileSync('./data/lifelog.csv','utf8'))
  })

  http.createServer((req, res) => {
    let r
    try{
      r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,"")))
    }catch(e){
    }
    console.log(r)
    robot.send({ room: r.channel }, r.text)
    if(r.text.match(/doorlog/gi)) doorlog(r.text)
    if(r.text.match(/close/gi && leave==='leave')){
      clearTimeout(leave)
      leave = 'arrive'
        request.get({
        url: `http://192.168.0.62:9001/?{"pin":${pin},"num":1}`,
      }, (error, response, body)=> {
      })
    }
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end("sucsess")
  }).listen(9002)

}