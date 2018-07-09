"use strict"
const fs = require("fs");
const cron = require("cron").CronJob;

module.exports = async robot => {

  //respond リプライ化が必要
  //hear 勝手に拾ってくれる

  robot.hear(/^todo|^buy/i, function (msg) {
    let text = msg.message.text;
    let val
    switch(text.match(/^todo|^buy/gi)[0]){
      case "todo":
        val={
          "name":"todo",
          "regOnly":/^todo$/,
          "regAdd":/^todo\s+add\s+/,
          "regAddAny":/^todo\s+add\s+.+/,
          "regRm":/^todo\s+rm\s+/,
          "regRmAny":/^todo\s+rm\s+.+/,
          "regRemaind":/^todo\s+remaind\s+/,
          "regRemaindAny":/^todo\s+remaind\s+.+/
        }
      break;
      case "buy":
      val={
        "name":"buy",
        "regOnly":/^buy$/,
        "regAdd":/^buy\s+add\s+/,
        "regAddAny":/^buy\s+add\s+.+/,
        "regRm":/^buy\s+rm\s+/,
        "regRmAny":/^buy\s+rm\s+.+/,
        "regRemaind":/^buy\s+remaind\s+/,
        "regRemaindAny":/^buy\s+remaind\s+.+/
      }
      break;
    }
    let message = "";
    let json = JSON.parse(fs.readFileSync("./data/todo.json","utf8"));
    if(text.match(val.regOnly)){
    }else if(text.match(val.regAddAny)){
      json[val.name].push({"name":text.replace(val.regAdd,""),remaind:[]});
      message = "追加しました"
      fs.writeFileSync("./data/todo.json",JSON.stringify(json),"utf8");
    }else if(text.match(val.regRmAny)){
      text = text.replace(val.regRm,"")
      let num;
      let list = []
      for(let i=0;i<json[val.name].length;i++){
        list.push(json[val.name][i].name)
      }
      text.match(/\d+/) ? num = text : num = list.indexOf(text,0)
      if(num!=-1){
        if(json[val.name].splice(num,1).length===1){
          fs.writeFileSync("./data/todo.json",JSON.stringify(json),"utf8");
          message = "削除しました。"
        }else{
          message = "ヒットしない為削除が出来ません。"
        }
      }else{
        message = "ヒットしない為削除が出来ません。"
      }
    }else if(text.match(val.regRemaindAny)){
      text = text.replace(val.regRemaind,"")
      if(text.match(/\d+:\d+/)===null){
        null;
      }else{
        const c = a =>{
          if(a) return a[0]
          return null;
        }
        const day = () =>{
          if(text.match(/\s[0-6]\s/)) return text.match(/\s[0-6]\s/g)[0].replace(/\s/gi,"")
          return null;
        }
        const i = () =>{
          if(text.match(/i/)) return true;
          return null;
        }
        let r = {
          "num": c(text.match(/^\d+/g)),
          "time":c(text.match(/\d+:\d+/g)),
          "date":c(text.match(/\d+\/\d+/g)),
          "day":day(),
          "interval":i()
        };
        let num = r.num+""
        delete r.num
        json[val.name][num].remaind.push(r)
        fs.writeFileSync("./data/todo.json",JSON.stringify(json),"utf8");
        message = "リマインドを追加しました"
      }
    }else{
      message = `${val.name} リスト確認\n${val.name} add 追加\n${val.name} rm 削除`
    }
    let out = "";
    for(let i=0;i<json[val.name].length;i++){
      out += `${i} ${json[val.name][i].name}\n`
    }
    out.replace(/\n$/,"");
    msg.send(`\n${message}\n現在の${val.name}List:\n${out}`)
  });


  robot.hear(/^remaind/i, function (msg) {
    let text = msg.message.text;
    let json = JSON.parse(fs.readFileSync("./data/todo.json","utf8"));
    let remaindList = ["todo","buy"];
    let list = "";
    let message = "";
    let cnt = 0;
    let rm = true
    for(let i=0;i<remaindList.length;i++){
      for(let ii=0;ii<json[remaindList[i]].length;ii++){
        if(0<json[remaindList[i]][ii].remaind.length) for(let iii=0;iii<json[remaindList[i]][ii].remaind.length;iii++){
          if(rm&&text.match(/^remaind\s+rm\s+\d+/))if(text.match(/^remaind\s+rm\s+\d+/g)[0].replace(/^remaind\s+rm\s+/,"")===cnt+""){
            json[remaindList[i]][ii].remaind.splice([iii],1)
            iii--
            rm=false
            fs.writeFileSync("./data/todo.json",JSON.stringify(json),"utf8");
            message = "リマインドを削除しました"
          }
          if(rm===false){
            rm=null;
          }else{
            list += `${cnt} ${remaindList[i]} ${json[remaindList[i]][ii].name}\n${JSON.stringify(json[remaindList[i]][ii].remaind[iii])}\n`
            cnt++
          }
        }
      }
    }
    msg.send(`\n${message}\n登録されたリマインド:\n${list}`)
  })

//TODO日本時間対応
  new cron('0 * * * * *', () => {
    let json = JSON.parse(fs.readFileSync("./data/todo.json","utf8"));
    let remaindList = ["todo","buy"];
    for(let i=0;i<remaindList.length;i++){
      for(let ii=0;ii<json[remaindList[i]].length;ii++){
        if(json[remaindList[i]][ii].remaind)for(let iii=0;iii<json[remaindList[i]][ii].remaind.length;iii++){
          let now = new Date();
          let remaind = json[remaindList[i]][ii].remaind[iii];
          if(!!remaind){
            if(remaind.time) if(remaind.time.replace(/^0/,"").replace(/:0/,":")===`${now.getHours()}:${now.getMinutes()}`){
              if(!remaind.day||remaind.day.replace(/^0/,"").replace(/\/0/,"/")===`${now.getMonth()+1}/${now.getDate()}`){
                if(!remaind.date||remaind.date+""===now.getDay()+""){
                  robot.send({ room: "#botchannel" }, `リマインド\n${remaindList[i]}リストより\n${json[remaindList[i]][ii].name}`);
                  if(remaind.interval!=true) {
                    delete json[remaindList[i]][ii].remaind[iii];
                    iii--
                    fs.writeFileSync("./data/todo.json",JSON.stringify(json),"utf8");
                  }
                }
              }
            }
          }
        }
      }
    }
  }, null, true);

};