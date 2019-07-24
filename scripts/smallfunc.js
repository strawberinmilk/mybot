
module.exports = async robot => {
  robot.hear(/pcon/gi, function (msg) {
    require('wake_on_lan').wake(require('./ignore.js').asus_windws_macadress)
    msg.send("pcをつけました")
  })

  robot.hear(/ping/gi,msg=>{
    msg.send('pong')
  })
  
}
