const fs = require('fs')
const http = require('http')
const request = require('request')

//const pin = 25

let wifiConnect = null
let wifiTime = 0
let doorTime = 0
let leave = false
//let leaveTimeout = null

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
      //url: `http://192.168.0.62:9001/?{"pin":${pin},"num":1}`,
      url: `http://192.168.0.62:9001/lighton`,
    }, (error, response, body) => {
    })
    msg.send('ライトをつけます')
  })
  robot.hear(/lightoff/i, (msg) => {
    request.get({
      //url: `http://192.168.0.62:9001/?{"pin":${pin},"num":0}`,
      url: `http://192.168.0.62:9001/lightoff`,
    }, (error, response, body) => {
    })
    msg.send('ライトを消します')
  })

  robot.hear(/lightcode/i, (msg) => {
    const msgText = msg.message.text.replace(/\D/gi,'').split('')
    let query = ''
    for(let i=0;i<msgText.length;i++) query += `"light${i+1}":${msgText[i]},`
    query = query.replace(/,$/,'')
    request.get({
      url: `http://192.168.0.62:9001/?{"signal":"light",${query}}`,
    }, (error, response, body) => {
    })
    msg.send(`${msg.message.text} 実行します`)
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
    //check()
  }

  
  //leave
  robot.hear(/leave/gi,msg=>{
    //clearTimeout(leaveTimeout)
    //leaveTimeout = setTimeout(()=>{
    //  fs.appendFileSync('./data/lalog.csv',`${(new Date).toLocaleString()},leave,\n`,'utf8')
    //  request.get({
    //    //url: `http://192.168.0.62:9001/?{"pin":${pin},"num":0}`,
    //    url: `http://192.168.0.62:9001/lightoff`,
    //  }, (error, response, body)=> {
    //  })
    //  leave = true
    //  robot.send({ room: '#botchannel' }, 'leaveコマンドにより消灯')   
    //},600000)
    request.get({
        url: `http://192.168.0.62:9001/?{"signal":"status","leave":true}`,
      }, (error, response, body)=> {
      })
    msg.send('消灯手配しました')
  })

  robot.hear(/lifelog dump/gi ,(msg)=>{
    msg.send(fs.readFileSync('./data/lifelog.csv','utf8'))
  })

  http.createServer((req, res) => {
    let r
    try{
      r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,'')))
    }catch(e){
    }
    console.log(r)
    robot.send({ room: r.channel }, r.text)
    if(r.text.match(/doorlog/gi)) doorlog(r.text)
    
    //test
    //robot.send({ room: 'test' },JSON.stringify(r) )
    //test

    //if(r.text.match(/open/gi && leave)){
    //  //clearTimeout(leaveTimeout)
    //  leave = false
    //  request.get({
    //    //url: `http://192.168.0.62:9001/?{"pin":${pin},"num":1}`,
    //    url: `http://192.168.0.62:9001/lighton`,
    //  }, (error, response, body)=> {
    //    robot.send({ room: '#botchannel' }, 'leave===true&&doorOpenにより点灯')   
    //  })
    //}
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('sucsess')
  }).listen(9002)

}