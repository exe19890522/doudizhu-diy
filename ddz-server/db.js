const mysql = require('mysql');
let client = undefined;
const query =function (sql,cb) {
    client.getConnection((err,connection) => {
        if(err) {
            console.log('get connection = ' + err);
            if(cb){
                cb(err);
            }
        }else {
            connection.query(sql,(connErr,result) => {
                if(connErr) {
                    console.log(sql + connErr);
                    if(cb){
                        cb(connErr);
                    }
                }else {
                    if (cb){
                        cb(null,result);
                    }
                }
                connection.release();//释放掉连接池，即可连接很多玩家的多次连接了
            })
        }
    });
};

exports.getPlayerInfoWithAccountID = function (key,cb) {
    let sql = 'select * from t_account where account_id =' + key + ';';
    query(sql,cb);
};
exports.getPlayerInfoWithUniqueID = function (key, cb) {
    let sql = 'select * from t_account where unique_id = ' + key + ';';
    query(sql, cb);
};

//创建玩家信息
exports.createPlayerInfo = function (uniqueID, accountID, nickName, goldCount, avatarUrl) {
    // 'unique_id':'10000',
    // 'account_id':'1000’,
    // 'nick_name':'小明’,
    // 'gold_count':5,
    // 'avatar_url':'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=4210862602,3292489882&fm=27&gp=0.jpg'
    let sql = 'insert into t_account (unique_id,account_id,nick_name,gold_count,avatar_url) values('
        + "'" +uniqueID
        + "'" + ','
        + "'" + accountID
        + "'" + ','
        + "'" + nickName
        + "'" + ','
        + "'" + goldCount
        + "'" +','
        + "'" + avatarUrl
        + "'" + ');' ;

    query(sql,(err,data)=>{
        if(err){
            console.log('db:create player info = ' + err);
        }else{
            console.log('db:create player info = ' + JSON.stringify(data));
        }
    });
};

//创建一个连接池
exports.connect = function (config) {
    client = mysql.createPool(config);
};