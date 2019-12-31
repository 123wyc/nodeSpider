const util = require('util')
const mysql = require('mysql')

const defaultRetryLimit = 1    // 重试的次数
const defaultRetryInterval = 1 // 重试之前睡眠的秒数

function createConnection(config) {
    var retryLimit = defaultRetryLimit;
    var retryInterval = defaultRetryInterval;
    if (config.retry) {
        console.info(`[DBUTIL] Create connection with retry`)
        if (config.retry.limit > 0) retryLimit = config.retry.limit;
        if (config.retry.interval > 0) retryInterval = config.retry.interval;
    }

    var connection = mysql.createConnection(config);

    return {
        query(sql, args) {
            function next(retry, resolve, reject, error, results, fields) {
                if (retry >= retryLimit) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(results, fields)
                    }
                } else if (!error && retry > 0) {
                    resolve(results, fields)
                } else {
                    let intval = 0
                    if (retry > 0) intval = retryInterval;
                    if (error) {
                        // 碰到以下错误进行MySQL连接的重试
                        if (error.code == 'ENETUNREACH' ||
                            error.code == 'ECONNREFUSED' ||
                            error.code == 'ER_ACCESS_DENIED_ERROR' ||
                            error.code == 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'||
                            error.code == 'PROTOCOL_CONNECTION_LOST'
                        ) {
                            if (connection) connection.end();
                            console.log(`[DBUTIL] <NewCon: ${error.code}> Try ${retry} for "${sql}"`)
                            connection = mysql.createConnection(config);
                        } else {
                            console.log(`[DBUTIL] <Caught: ${error.code}> Try ${retry} for "${sql}"`)
                        }
                    }

                    connection.query(sql, args, (error, results, fields) => {
                        setTimeout(() => {
                            next(++retry, resolve, reject, error, results, fields);
                        }, intval * 1000);
                    });
                }
            }
            return new Promise((resolve, reject) => { next(0, resolve, reject); });
        },
        close() {
            return util.promisify(connection.end).call(connection);
        }
    };
}

exports.createConnection = createConnection
