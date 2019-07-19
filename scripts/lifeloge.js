const fs = require('fs')
module.exports = t=>{
  let time = new Date
  let text = `${time.toJSON()},${t},\n`
  fs.appendFileSync('./data/lifelog.csv',text,'utf8')
}