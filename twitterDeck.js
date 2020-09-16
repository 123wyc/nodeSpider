const puppeteer = require('puppeteer-core');
const config = require('./config');
const dbutil = require('./dbutil');
const store = require('./store');

(async () => {
    await twitterdeck()

})();
var NUM_MARK=0
async function twitterdeck() {
    const url = "https://tweetdeck.twitter.com" ;
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9226',
        defaultViewport: null // 浏览器大小
    });
    var page;
    var exists = false

    for (let cpage of await browser.pages()) {
        const curl = cpage.url()
        if (curl.indexOf("tweetdeck") >= 0) {
            page = cpage
            exists = true
        }
    }
    if (!exists) page = await browser.newPage();
     //await page.waitFor(100)
     page.on('response', async (response) => {
        var headers = response.headers()
        var contentType = headers['content-type']
    
        // 截获含有的‘home_timeline’的application/json的响应把json响应打印出来
        if (contentType && contentType.indexOf("json") >= 0 && response.url().indexOf('home_timeline')!= -1) {
          var data;
          try {
            data = inspect(await response.json());
          } catch (error) {
            try {
              data = await response.text();
              await DataRes(data)
              console.info("目前接口返回数据："+NUM_MARK+"条！")
            } catch (error) {
              data = '[ERROR]' + error;
            }
          }
          //console.log("[Response]", response.status(), response.url(), response.headers(), data);
        }
      });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
};

async function DataRes(data) {
    let obj = eval ("(" + data + ")")
    console.info("长度:"+obj.length)
    //var indexLibraryObj={} //入索引
    let DateArr =[]
    let crowlTime=await getNowFormatDate()
    for(let i=0;i<obj.length;i++){
       NUM_MARK ++;
       //let DateArr =[]
       let DataObj=[]
       var indexLibraryObj={} //入索引
       var indexUserObj={} // 入作者索引

       let Text =  obj[i].full_text
       let id =  obj[i].conversation_id_str
       let time =  await DateFormat(obj[i].created_at)
       let username = obj[i].user.name
       let screenname = obj[i].user.screen_name
       let retweet_count = obj[i].retweet_count
       let favorite_count =obj[i].favorite_count
       let reply_count =obj[i].reply_count
       let long = obj[i].lang
       let url = "https://twitter.com/"+screenname+"/status/"+id
       console.info(id)
       DataObj.push(id,Text,time,username,screenname,url,retweet_count,favorite_count,reply_count,long,crowlTime,config.cl_account)
       DateArr.push(DataObj)
       //await store.InsertSql(DateArr)

       indexLibraryObj.id = "twitter-"+id
       indexLibraryObj.url = url
       indexLibraryObj.content = Text
       indexLibraryObj.ps = await timestamp(time)
       indexLibraryObj.author={
         id:screenname,
         name:username
       }
       indexLibraryObj.source ='twitter'
       indexLibraryObj.extra={
         replynum : reply_count,
         retweetnum :retweet_count,
         likenum : favorite_count,
         long:long
       }
       indexUserObj.id = screenname
       indexUserObj.name = username
       indexUserObj.source = "twitter"
       await store.IndexUser(indexUserObj)
       await store.Index(indexLibraryObj)
    }
    await store.InsertSql(DateArr) // 插库
    //await store.Index(indexLibraryObj)
}

async function DateFormat(time) {
    let d = new Date(time)
    let resDate = d.getFullYear() + '-' + await p((d.getMonth() + 1)) + '-' + await p(d.getDate())
    let resTime = await p(d.getHours()) + ':' + await p(d.getMinutes()) + ':' + await p(d.getSeconds())
    return resDate+" "+resTime
}
//获取当前时间
async function getNowFormatDate() {
    let d = new Date()
    let resDate = d.getFullYear() + '-' + await p((d.getMonth() + 1)) + '-' + await p(d.getDate())
    let resTime = await p(d.getHours()) + ':' + await p(d.getMinutes()) + ':' + await p(d.getSeconds())
    return resDate+" "+resTime
}
async function p(s){
    return s < 10 ? '0' + s : s
}
//时间格式化时间戳
async function timestamp(thisTime){
    if(thisTime==""){
       return ""
    }
    var time = new Date(thisTime);
    times = time.getTime()
    return times/1000
}