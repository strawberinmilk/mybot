
const http = require('http');


module.exports = async robot => {

  http.createServer((req, res) => {
    let r;
    try{
      r = JSON.parse(decodeURIComponent(req.url.replace(/\/|\?/gi,"")));
    }catch(e){
    }
    robot.send({ room: r.channel }, r.text)
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("sucsess");
  }).listen(9002);
}
