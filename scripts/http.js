
const http = require('http');


module.exports = async robot => {

  http.createServer((req, res) => {
    let r;
    try{
      r = decodeURIComponent(req.url.replace(/\/|\?/gi,""));
  
    }catch(e){
    }
    robot.send({ room: "#botchannel" }, r)
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("sucsess");
  }).listen(9002);
}
