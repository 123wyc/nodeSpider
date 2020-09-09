const config = require('./config');
const dbutil = require('./dbutil');
const fetch = require("node-fetch");
const mysql = require('mysql')

async function InsertSql(objarr) {
    const db = dbutil.createConnection(config.mysql);  
    //console.info(objarr)
    try{
        var addsql ='INSERT IGNORE INTO tw_tweet_deck (id,text,release_time,user_name,screen_name,link,retweet_count,favorite_count,reply_count,language,crawltime,cl_account) VALUES ?';
        await db.query(addsql,[objarr])
    }catch(e){
        console.error(e);
    }
    finally{
        await db.close()
    }
}
// 索引数据
async function Index(data) {
    //console.info("indexLibraryObj",data)
    // 1. 插入索引库
      var ires = await fetch(config.indexer, {
          method: "POST",
          body: JSON.stringify(data)
      });
      console.info(JSON.stringify(data))
      var body = await ires.text();
      if (ires.status == 200) {                
          console.log('post success');
      } else {
          console.log('post error');
      }
  }
  
exports.InsertSql = InsertSql
exports.Index = Index