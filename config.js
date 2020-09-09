const config = {
    mysql: {
        host: '127.0.0.1',
        // port: 4000,
        // user: 'whatsapp',
        // password: 'whatsapp',
        // database: 'social_media',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'test',

        retry: {
            limit: 10,   // MySQL重试次数，最少一次
            interval: 3 // 每次重试之前睡眠的秒数，最少一秒
        }
    },
    indexer: "http://192.168.20.136:16140/ridx/v1/update"
}
module.exports = config;

