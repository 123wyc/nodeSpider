const config = {
    mysql: {
        host: '192.168.20.8',
        port: 4000,
        user: 'whatsapp',
        password: 'whatsapp',
        database: 'social_media',
        retry: {
            limit: 10,   // MySQL重试次数，最少一次
            interval: 3 // 每次重试之前睡眠的秒数，最少一秒
        }
    },
    indexer: "http://192.168.20.136:16140/update"
}

module.exports = config;